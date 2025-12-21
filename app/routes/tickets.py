from flask import Blueprint, request, jsonify, current_app
from datetime import datetime, timedelta
from app import db, limiter
from app.models.event import Event
from app.models.ticket import TicketType, Booking, Ticket, PromoCode
from app.models.payment import Payment
from app.utils.decorators import user_required, partner_required
from app.utils.qrcode_generator import generate_qr_code
from app.utils.email import send_booking_confirmation_email, send_booking_cancellation_email, send_booking_cancellation_to_partner_email

bp = Blueprint('tickets', __name__)


@bp.route('/validate-promo', methods=['POST'])
@user_required
def validate_promo_code(current_user):
    """Validate promo code"""
    data = request.get_json()
    
    if not data.get('code') or not data.get('event_id'):
        return jsonify({'error': 'code and event_id are required'}), 400
    
    # Find promo code
    promo = PromoCode.query.filter_by(
        code=data['code'].upper(),
        event_id=data['event_id'],
        is_active=True
    ).first()
    
    if not promo:
        return jsonify({'error': 'Invalid promo code'}), 404
    
    # Check validity period
    now = datetime.utcnow()
    if promo.valid_from and now < promo.valid_from:
        return jsonify({'error': 'Promo code not yet valid'}), 400
    
    if promo.valid_until and now > promo.valid_until:
        return jsonify({'error': 'Promo code expired'}), 400
    
    # Check usage limits
    if promo.max_uses and promo.current_uses >= promo.max_uses:
        return jsonify({'error': 'Promo code usage limit reached'}), 400
    
    # Check per-user usage
    user_usage = Booking.query.filter_by(
        user_id=current_user.id,
        promo_code_id=promo.id
    ).count()
    
    if user_usage >= promo.max_uses_per_user:
        return jsonify({'error': 'You have already used this promo code'}), 400
    
    return jsonify({
        'valid': True,
        'promo_code': promo.to_dict()
    }), 200


@bp.route('/book', methods=['POST'])
@user_required
def book_event(current_user):
    """Book tickets for an event"""
    data = request.get_json()
    
    # Validate required fields
    if not data.get('event_id') or not data.get('ticket_type_id'):
        return jsonify({'error': 'event_id and ticket_type_id are required'}), 400
    
    quantity = data.get('quantity', 1)
    
    if quantity < 1:
        return jsonify({'error': 'Quantity must be at least 1'}), 400
    
    # Get event
    event = Event.query.get(data['event_id'])
    if not event:
        return jsonify({'error': 'Event not found'}), 404
    
    if event.status != 'approved' or not event.is_published:
        return jsonify({'error': 'Event is not available for booking'}), 400
    
    # Check if event is in the past
    if event.start_date < datetime.utcnow():
        return jsonify({'error': 'Cannot book past events'}), 400
    
    # Get ticket type
    ticket_type = TicketType.query.filter_by(
        id=data['ticket_type_id'],
        event_id=event.id,
        is_active=True
    ).first()
    
    if not ticket_type:
        return jsonify({'error': 'Ticket type not found'}), 404
    
    # Check quantity limits
    if quantity < ticket_type.min_per_order:
        return jsonify({'error': f'Minimum {ticket_type.min_per_order} tickets required'}), 400
    
    if quantity > ticket_type.max_per_order:
        return jsonify({'error': f'Maximum {ticket_type.max_per_order} tickets allowed'}), 400
    
    # Check availability
    if ticket_type.quantity_available is not None:
        if quantity > ticket_type.quantity_available:
            return jsonify({'error': 'Not enough tickets available'}), 400
    
    # Check sales period
    now = datetime.utcnow()
    if ticket_type.sales_start and now < ticket_type.sales_start:
        return jsonify({'error': 'Ticket sales have not started yet'}), 400
    
    if ticket_type.sales_end and now > ticket_type.sales_end:
        return jsonify({'error': 'Ticket sales have ended'}), 400
    
    # Calculate amount
    ticket_price = float(ticket_type.price)
    total_amount = ticket_price * quantity
    discount_amount = 0
    
    # Apply promo code if provided
    promo_code = None
    if data.get('promo_code'):
        promo = PromoCode.query.filter_by(
            code=data['promo_code'].upper(),
            event_id=event.id,
            is_active=True
        ).first()
        
        if promo:
            # Calculate discount
            if promo.discount_type == 'percentage':
                discount_amount = total_amount * (float(promo.discount_value) / 100)
            else:  # fixed
                discount_amount = float(promo.discount_value)
            
            # Ensure discount doesn't exceed total
            discount_amount = min(discount_amount, total_amount)
            promo_code = promo
    
    final_amount = total_amount - discount_amount
    
    # Calculate platform fee (7%)
    commission_rate = current_app.config.get('PLATFORM_COMMISSION_RATE', 0.07)
    platform_fee = final_amount * commission_rate
    partner_amount = final_amount - platform_fee
    
    # Create booking with 5-minute reservation timer for paid events
    reserved_until = None
    if not event.is_free:
        reserved_until = datetime.utcnow() + timedelta(minutes=5)
    
    # Create booking
    booking = Booking(
        user_id=current_user.id,
        event_id=event.id,
        quantity=quantity,
        total_amount=final_amount,
        platform_fee=platform_fee,
        partner_amount=partner_amount,
        discount_amount=discount_amount,
        promo_code_id=promo_code.id if promo_code else None,
        status='pending',
        payment_status='unpaid' if not event.is_free else 'paid',
        reserved_until=reserved_until
    )
    
    db.session.add(booking)
    db.session.flush()  # Get booking ID
    
    # For free events, auto-confirm
    if event.is_free:
        booking.status = 'confirmed'
        booking.confirmed_at = datetime.utcnow()
        
        # Create tickets
        tickets = []
        for i in range(quantity):
            ticket = Ticket(
                booking_id=booking.id,
                ticket_type_id=ticket_type.id
            )
            db.session.add(ticket)
            db.session.flush()
            
            # Generate QR code
            qr_data = ticket.ticket_number
            qr_path = generate_qr_code(qr_data, ticket.ticket_number)
            ticket.qr_code = qr_path
            
            tickets.append(ticket)
        
        # Update ticket availability
        if ticket_type.quantity_available is not None:
            ticket_type.quantity_available -= quantity
            ticket_type.quantity_sold += quantity
        
        # Update event stats
        event.attendee_count += quantity
        event.total_tickets_sold += quantity
        
        # Update promo code usage
        if promo_code:
            promo_code.current_uses += 1
        
        db.session.commit()
        
        # Send confirmation email
        send_booking_confirmation_email(booking, tickets)
        
        return jsonify({
            'message': 'Booking confirmed!',
            'booking': booking.to_dict(),
            'requires_payment': False
        }), 201
    
    # For paid events, require payment
    db.session.commit()
    
    return jsonify({
        'message': 'Booking created. Please proceed to payment.',
        'booking': booking.to_dict(),
        'requires_payment': True,
        'amount': float(final_amount)
    }), 201


@bp.route('/bookings/<int:booking_id>/cancel', methods=['POST'])
@user_required
def cancel_booking(current_user, booking_id):
    """Cancel booking"""
    booking = Booking.query.filter_by(
        id=booking_id,
        user_id=current_user.id
    ).first()
    
    if not booking:
        return jsonify({'error': 'Booking not found'}), 404
    
    if booking.status == 'cancelled':
        return jsonify({'error': 'Booking already cancelled'}), 400
    
    # Check if event has already started
    if booking.event.start_date < datetime.utcnow():
        return jsonify({'error': 'Cannot cancel booking for past events'}), 400
    
    # Cancel booking
    booking.status = 'cancelled'
    booking.cancelled_at = datetime.utcnow()
    
    # Restore ticket availability
    if booking.status == 'confirmed':
        for ticket in booking.tickets:
            ticket.is_valid = False
        
        ticket_type = booking.tickets.first().ticket_type if booking.tickets.first() else None
        if ticket_type and ticket_type.quantity_available is not None:
            ticket_type.quantity_available += booking.quantity
            ticket_type.quantity_sold -= booking.quantity
        
        # Update event stats
        booking.event.attendee_count -= booking.quantity
        booking.event.total_tickets_sold -= booking.quantity
    
    # TODO: Process refund if paid
    
    db.session.commit()
    
    # Send cancellation emails
    try:
        send_booking_cancellation_email(current_user, booking, booking.event)
    except Exception as email_error:
        current_app.logger.warning(f'Failed to send cancellation email to user: {str(email_error)}')
    
    try:
        partner = booking.event.organizer if booking.event else None
        if partner:
            send_booking_cancellation_to_partner_email(partner, booking, booking.event)
    except Exception as email_error:
        current_app.logger.warning(f'Failed to send cancellation email to partner: {str(email_error)}')
    
    return jsonify({
        'message': 'Booking cancelled successfully'
    }), 200


@bp.route('/<ticket_number>/verify', methods=['GET'])
@partner_required
def verify_ticket(current_partner, ticket_number):
    """Verify ticket for check-in"""
    ticket = Ticket.query.filter_by(ticket_number=ticket_number).first()
    
    if not ticket:
        return jsonify({'error': 'Ticket not found'}), 404
    
    # Check if ticket belongs to partner's event
    if ticket.booking.event.partner_id != current_partner.id:
        return jsonify({'error': 'Unauthorized'}), 403
    
    # Check if ticket is valid
    if not ticket.is_valid:
        return jsonify({
            'valid': False,
            'error': 'Ticket is not valid'
        }), 200
    
    if ticket.is_scanned:
        return jsonify({
            'valid': False,
            'error': 'Ticket already scanned',
            'scanned_at': ticket.scanned_at.isoformat() if ticket.scanned_at else None
        }), 200
    
    # Check if booking is confirmed
    if ticket.booking.status != 'confirmed':
        return jsonify({
            'valid': False,
            'error': 'Booking not confirmed'
        }), 200
    
    return jsonify({
        'valid': True,
        'ticket': ticket.to_dict(),
        'booking': ticket.booking.to_dict(),
        'attendee': ticket.booking.user.to_dict()
    }), 200


@bp.route('/<ticket_number>/checkin', methods=['POST'])
@partner_required
def checkin_ticket(current_partner, ticket_number):
    """Check-in ticket"""
    ticket = Ticket.query.filter_by(ticket_number=ticket_number).first()
    
    if not ticket:
        return jsonify({'error': 'Ticket not found'}), 404
    
    # Check if ticket belongs to partner's event
    if ticket.booking.event.partner_id != current_partner.id:
        return jsonify({'error': 'Unauthorized'}), 403
    
    # Check if already scanned
    if ticket.is_scanned:
        return jsonify({'error': 'Ticket already scanned'}), 400
    
    # Check if valid
    if not ticket.is_valid:
        return jsonify({'error': 'Ticket is not valid'}), 400
    
    # Check-in
    ticket.is_scanned = True
    ticket.scanned_at = datetime.utcnow()
    
    # Update booking check-in status
    if not ticket.booking.is_checked_in:
        ticket.booking.is_checked_in = True
        ticket.booking.checked_in_at = datetime.utcnow()
        ticket.booking.checked_in_by = current_partner.id
    
    db.session.commit()
    
    return jsonify({
        'message': 'Ticket checked in successfully',
        'ticket': ticket.to_dict(),
        'attendee': ticket.booking.user.to_dict()
    }), 200


@bp.route('/scan', methods=['POST'])
@partner_required
def scan_ticket(current_partner):
    """Scan and check-in ticket by QR code data"""
    data = request.get_json()
    
    if not data.get('qr_data'):
        return jsonify({'error': 'qr_data is required'}), 400
    
    # QR data should be the ticket number
    ticket_number = data['qr_data']
    
    # Verify and check-in in one step
    ticket = Ticket.query.filter_by(ticket_number=ticket_number).first()
    
    if not ticket:
        return jsonify({'error': 'Ticket not found'}), 404
    
    # Check if ticket belongs to partner's event
    if ticket.booking.event.partner_id != current_partner.id:
        return jsonify({'error': 'Unauthorized'}), 403
    
    # Check if already scanned
    if ticket.is_scanned:
        return jsonify({
            'success': False,
            'error': 'Ticket already scanned',
            'scanned_at': ticket.scanned_at.isoformat() if ticket.scanned_at else None,
            'attendee': ticket.booking.user.to_dict()
        }), 200
    
    # Check if valid
    if not ticket.is_valid or ticket.booking.status != 'confirmed':
        return jsonify({
            'success': False,
            'error': 'Ticket is not valid'
        }), 200
    
    # Check-in
    ticket.is_scanned = True
    ticket.scanned_at = datetime.utcnow()
    
    if not ticket.booking.is_checked_in:
        ticket.booking.is_checked_in = True
        ticket.booking.checked_in_at = datetime.utcnow()
        ticket.booking.checked_in_by = current_partner.id
    
    db.session.commit()
    
    return jsonify({
        'success': True,
        'message': 'Ticket checked in successfully',
        'ticket': ticket.to_dict(),
        'attendee': ticket.booking.user.to_dict()
    }), 200


@bp.route('/release-expired', methods=['POST'])
@limiter.exempt
def release_expired_bookings():
    """Release expired pending bookings (called by background task or frontend)"""
    try:
        # Find all pending bookings that have expired (reserved_until < now)
        expired_bookings = Booking.query.filter(
            Booking.status == 'pending',
            Booking.payment_status == 'unpaid',
            Booking.reserved_until.isnot(None),
            Booking.reserved_until < datetime.utcnow()
        ).all()
        
        released_count = 0
        for booking in expired_bookings:
            # Cancel the expired booking
            booking.status = 'cancelled'
            booking.cancelled_at = datetime.utcnow()
            
            # Restore promo code usage if applicable
            if booking.promo_code:
                booking.promo_code.current_uses = max(0, booking.promo_code.current_uses - 1)
            
            released_count += 1
        
        if released_count > 0:
            db.session.commit()
            current_app.logger.info(f'Released {released_count} expired bookings')
        
        return jsonify({
            'message': f'Released {released_count} expired booking(s)',
            'released_count': released_count
        }), 200
        
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f'Error releasing expired bookings: {str(e)}')
        return jsonify({'error': 'Failed to release expired bookings'}), 500

