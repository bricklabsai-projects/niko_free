from datetime import datetime
from app import db
import uuid


class TicketType(db.Model):
    """Ticket types for events"""
    __tablename__ = 'ticket_types'
    
    id = db.Column(db.Integer, primary_key=True)
    event_id = db.Column(db.Integer, db.ForeignKey('events.id', ondelete='CASCADE'), nullable=False)
    
    name = db.Column(db.String(100), nullable=False)  # e.g., "Early Bird", "VIP", "General Admission"
    description = db.Column(db.Text, nullable=True)
    price = db.Column(db.Numeric(10, 2), nullable=False, default=0.00)
    
    # Availability
    quantity_total = db.Column(db.Integer, nullable=True)  # None = unlimited
    quantity_sold = db.Column(db.Integer, default=0)
    quantity_available = db.Column(db.Integer, nullable=True)
    
    # Sales Period
    sales_start = db.Column(db.DateTime, nullable=True)
    sales_end = db.Column(db.DateTime, nullable=True)
    
    # Settings
    is_active = db.Column(db.Boolean, default=True)
    min_per_order = db.Column(db.Integer, default=1)
    max_per_order = db.Column(db.Integer, default=10)
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'event_id': self.event_id,
            'name': self.name,
            'description': self.description,
            'price': float(self.price),
            'quantity_total': self.quantity_total,
            'quantity_sold': self.quantity_sold,
            'quantity_available': self.quantity_available,
            'sales_start': self.sales_start.isoformat() if self.sales_start else None,
            'sales_end': self.sales_end.isoformat() if self.sales_end else None,
            'is_active': self.is_active,
            'min_per_order': self.min_per_order,
            'max_per_order': self.max_per_order
        }


class Booking(db.Model):
    """Booking/Registration for events"""
    __tablename__ = 'bookings'
    
    id = db.Column(db.Integer, primary_key=True)
    booking_number = db.Column(db.String(50), unique=True, nullable=False, index=True)
    
    # References
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    event_id = db.Column(db.Integer, db.ForeignKey('events.id', ondelete='CASCADE'), nullable=False)
    
    # Booking Details
    quantity = db.Column(db.Integer, default=1)
    total_amount = db.Column(db.Numeric(10, 2), default=0.00)
    platform_fee = db.Column(db.Numeric(10, 2), default=0.00)
    partner_amount = db.Column(db.Numeric(10, 2), default=0.00)
    
    # Promo Code
    promo_code_id = db.Column(db.Integer, db.ForeignKey('promo_codes.id'), nullable=True)
    discount_amount = db.Column(db.Numeric(10, 2), default=0.00)
    
    # Status
    status = db.Column(db.String(20), default='pending')  # pending, confirmed, cancelled, refunded
    payment_status = db.Column(db.String(20), default='unpaid')  # unpaid, paid, refunded
    payment_id = db.Column(db.Integer, db.ForeignKey('payments.id'), nullable=True)
    
    # Check-in
    is_checked_in = db.Column(db.Boolean, default=False)
    checked_in_at = db.Column(db.DateTime, nullable=True)
    checked_in_by = db.Column(db.Integer, db.ForeignKey('partners.id'), nullable=True)
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow, index=True)
    confirmed_at = db.Column(db.DateTime, nullable=True)
    cancelled_at = db.Column(db.DateTime, nullable=True)
    
    # Relationships
    tickets = db.relationship('Ticket', backref='booking', lazy='dynamic', cascade='all, delete-orphan')
    payment = db.relationship('Payment', backref='booking', foreign_keys=[payment_id])
    promo_code = db.relationship('PromoCode', backref='bookings')
    
    def __init__(self, **kwargs):
        super(Booking, self).__init__(**kwargs)
        if not self.booking_number:
            self.booking_number = self.generate_booking_number()
    
    @staticmethod
    def generate_booking_number():
        """Generate unique booking number"""
        return f"NF-{datetime.utcnow().strftime('%Y%m%d')}-{uuid.uuid4().hex[:8].upper()}"
    
    def to_dict(self):
        return {
            'id': self.id,
            'booking_number': self.booking_number,
            'user': self.user.to_dict() if self.user else None,
            'event': self.event.to_dict() if self.event else None,
            'quantity': self.quantity,
            'total_amount': float(self.total_amount),
            'discount_amount': float(self.discount_amount),
            'status': self.status,
            'payment_status': self.payment_status,
            'is_checked_in': self.is_checked_in,
            'checked_in_at': self.checked_in_at.isoformat() if self.checked_in_at else None,
            'created_at': self.created_at.isoformat(),
            'confirmed_at': self.confirmed_at.isoformat() if self.confirmed_at else None,
            'reserved_until': self.reserved_until.isoformat() if self.reserved_until else None,
            'tickets': [ticket.to_dict() for ticket in self.tickets]
        }


class Ticket(db.Model):
    """Individual tickets"""
    __tablename__ = 'tickets'
    
    id = db.Column(db.Integer, primary_key=True)
    ticket_number = db.Column(db.String(50), unique=True, nullable=False, index=True)
    qr_code = db.Column(db.String(500), nullable=True)  # Path to QR code image
    
    # References
    booking_id = db.Column(db.Integer, db.ForeignKey('bookings.id', ondelete='CASCADE'), nullable=False)
    ticket_type_id = db.Column(db.Integer, db.ForeignKey('ticket_types.id'), nullable=False)
    
    # Status
    is_valid = db.Column(db.Boolean, default=True)
    is_scanned = db.Column(db.Boolean, default=False)
    scanned_at = db.Column(db.DateTime, nullable=True)
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    ticket_type = db.relationship('TicketType', backref='tickets')
    
    def __init__(self, **kwargs):
        super(Ticket, self).__init__(**kwargs)
        if not self.ticket_number:
            self.ticket_number = self.generate_ticket_number()
    
    @staticmethod
    def generate_ticket_number():
        """Generate unique ticket number"""
        return f"TKT-{datetime.utcnow().strftime('%Y%m%d')}-{uuid.uuid4().hex[:10].upper()}"
    
    def to_dict(self):
        return {
            'id': self.id,
            'ticket_number': self.ticket_number,
            'qr_code': self.qr_code,
            'ticket_type': self.ticket_type.to_dict() if self.ticket_type else None,
            'is_valid': self.is_valid,
            'is_scanned': self.is_scanned,
            'scanned_at': self.scanned_at.isoformat() if self.scanned_at else None,
            'created_at': self.created_at.isoformat()
        }


class PromoCode(db.Model):
    """Promo codes for events"""
    __tablename__ = 'promo_codes'
    
    id = db.Column(db.Integer, primary_key=True)
    code = db.Column(db.String(50), unique=True, nullable=False, index=True)
    
    # References
    event_id = db.Column(db.Integer, db.ForeignKey('events.id', ondelete='CASCADE'), nullable=False)
    
    # Discount
    discount_type = db.Column(db.String(20), nullable=False)  # percentage, fixed
    discount_value = db.Column(db.Numeric(10, 2), nullable=False)
    
    # Usage Limits
    max_uses = db.Column(db.Integer, nullable=True)  # None = unlimited
    current_uses = db.Column(db.Integer, default=0)
    max_uses_per_user = db.Column(db.Integer, default=1)
    
    # Validity Period
    valid_from = db.Column(db.DateTime, nullable=True)
    valid_until = db.Column(db.DateTime, nullable=True)
    
    # Status
    is_active = db.Column(db.Boolean, default=True)
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    created_by = db.Column(db.Integer, db.ForeignKey('partners.id'), nullable=False)
    
    def to_dict(self):
        return {
            'id': self.id,
            'code': self.code,
            'event_id': self.event_id,
            'discount_type': self.discount_type,
            'discount_value': float(self.discount_value),
            'max_uses': self.max_uses,
            'current_uses': self.current_uses,
            'valid_from': self.valid_from.isoformat() if self.valid_from else None,
            'valid_until': self.valid_until.isoformat() if self.valid_until else None,
            'is_active': self.is_active
        }

