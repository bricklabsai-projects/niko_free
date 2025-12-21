import { X, Wallet, Building2, CheckCircle, AlertCircle } from 'lucide-react';
import { useState } from 'react';

interface WithdrawFundsProps {
  isOpen: boolean;
  onClose: () => void;
  availableBalance: number;
}

export default function WithdrawFunds({ isOpen, onClose, availableBalance }: WithdrawFundsProps) {
  const [step, setStep] = useState<'method' | 'details' | 'confirm' | 'success'>('method');
  const [withdrawMethod, setWithdrawMethod] = useState<'mpesa' | 'bank' | null>(null);
  const [amount, setAmount] = useState('');
  const [mpesaPhone, setMpesaPhone] = useState('');
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountName, setAccountName] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleMethodSelect = (method: 'mpesa' | 'bank') => {
    setWithdrawMethod(method);
    setStep('details');
    setError('');
  };

  const handleBack = () => {
    if (step === 'details') {
      setStep('method');
      setWithdrawMethod(null);
    } else if (step === 'confirm') {
      setStep('details');
    }
  };

  const handleNext = () => {
    setError('');
    
    // Validate amount
    const withdrawAmount = parseFloat(amount);
    if (!amount || withdrawAmount <= 0) {
      setError('Please enter a valid amount');
      return;
    }
    if (withdrawAmount > availableBalance) {
      setError(`Amount exceeds available balance (Ksh ${availableBalance.toLocaleString()})`);
      return;
    }
    if (withdrawAmount < 100) {
      setError('Minimum withdrawal amount is Ksh 100');
      return;
    }

    // Validate based on method
    if (withdrawMethod === 'mpesa') {
      if (!mpesaPhone || mpesaPhone.length < 10) {
        setError('Please enter a valid M-Pesa phone number');
        return;
      }
    } else if (withdrawMethod === 'bank') {
      if (!bankName || !accountNumber || !accountName) {
        setError('Please fill in all bank details');
        return;
      }
      if (accountNumber.length < 8) {
        setError('Please enter a valid account number');
        return;
      }
    }

    setStep('confirm');
  };

  const handleConfirm = () => {
    // In production, this would call the API to process withdrawal
    setStep('success');
    
    // Auto-close after 3 seconds
    setTimeout(() => {
      handleClose();
    }, 3000);
  };

  const handleClose = () => {
    setStep('method');
    setWithdrawMethod(null);
    setAmount('');
    setMpesaPhone('');
    setBankName('');
    setAccountNumber('');
    setAccountName('');
    setError('');
    onClose();
  };

  const formatPhoneNumber = (value: string) => {
    // Remove non-digits
    const digits = value.replace(/\D/g, '');
    
    // Format as +254 XXX XXXXXX
    if (digits.startsWith('254')) {
      const formatted = digits.substring(3);
      if (formatted.length <= 3) return `+254 ${formatted}`;
      return `+254 ${formatted.substring(0, 3)} ${formatted.substring(3, 9)}`;
    } else if (digits.startsWith('0')) {
      const formatted = digits.substring(1);
      if (formatted.length <= 3) return `+254 ${formatted}`;
      return `+254 ${formatted.substring(0, 3)} ${formatted.substring(3, 9)}`;
    } else {
      if (digits.length <= 3) return `+254 ${digits}`;
      return `+254 ${digits.substring(0, 3)} ${digits.substring(3, 9)}`;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between z-10">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Withdraw Funds</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Available Balance: <span className="font-bold text-[#27aae2]">Ksh {availableBalance.toLocaleString()}</span>
            </p>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Step 1: Select Method */}
          {step === 'method' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Select Withdrawal Method</h3>
              
              <button
                onClick={() => handleMethodSelect('mpesa')}
                className="w-full p-6 border-2 border-gray-200 dark:border-gray-600 rounded-xl hover:border-[#27aae2] hover:bg-[#27aae2]/5 transition-all group"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Wallet className="w-8 h-8 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="flex-1 text-left">
                    <h4 className="text-lg font-bold text-gray-900 dark:text-white">M-Pesa</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Instant transfer to your M-Pesa number</p>
                    <p className="text-xs text-green-600 dark:text-green-400 font-semibold mt-1">⚡ Instant • No fees</p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => handleMethodSelect('bank')}
                className="w-full p-6 border-2 border-gray-200 dark:border-gray-600 rounded-xl hover:border-[#27aae2] hover:bg-[#27aae2]/5 transition-all group"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Building2 className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="flex-1 text-left">
                    <h4 className="text-lg font-bold text-gray-900 dark:text-white">Bank Transfer</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Direct transfer to your bank account</p>
                    <p className="text-xs text-blue-600 dark:text-blue-400 font-semibold mt-1">🏦 1-3 business days</p>
                  </div>
                </div>
              </button>
            </div>
          )}

          {/* Step 2: Enter Details */}
          {step === 'details' && (
            <div className="space-y-6">
              <button
                onClick={handleBack}
                className="text-[#27aae2] hover:text-[#1e8bc3] font-semibold text-sm flex items-center"
              >
                ← Back to methods
              </button>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Amount to Withdraw
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 font-semibold">
                    Ksh
                  </span>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0"
                    className="w-full pl-14 pr-4 py-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-[#27aae2] focus:border-transparent text-lg font-semibold"
                  />
                </div>
                <div className="flex items-center justify-between mt-2">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Minimum: Ksh 100</p>
                  <button
                    onClick={() => setAmount(availableBalance.toString())}
                    className="text-xs text-[#27aae2] hover:text-[#1e8bc3] font-semibold"
                  >
                    Use max balance
                  </button>
                </div>
              </div>

              {withdrawMethod === 'mpesa' && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    M-Pesa Phone Number
                  </label>
                  <input
                    type="tel"
                    value={mpesaPhone}
                    onChange={(e) => setMpesaPhone(formatPhoneNumber(e.target.value))}
                    placeholder="+254 XXX XXXXXX"
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-[#27aae2] focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    Enter the M-Pesa number to receive funds
                  </p>
                </div>
              )}

              {withdrawMethod === 'bank' && (
                <>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Bank Name
                    </label>
                    <select
                      value={bankName}
                      onChange={(e) => setBankName(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-[#27aae2] focus:border-transparent"
                    >
                      <option value="">Select your bank</option>
                      <option value="Equity Bank">Equity Bank</option>
                      <option value="KCB Bank">KCB Bank</option>
                      <option value="Cooperative Bank">Cooperative Bank</option>
                      <option value="NCBA Bank">NCBA Bank</option>
                      <option value="Absa Bank">Absa Bank</option>
                      <option value="Standard Chartered">Standard Chartered</option>
                      <option value="Stanbic Bank">Stanbic Bank</option>
                      <option value="I&M Bank">I&M Bank</option>
                      <option value="DTB Bank">DTB Bank</option>
                      <option value="Family Bank">Family Bank</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Account Number
                    </label>
                    <input
                      type="text"
                      value={accountNumber}
                      onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, ''))}
                      placeholder="Enter account number"
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-[#27aae2] focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Account Name
                    </label>
                    <input
                      type="text"
                      value={accountName}
                      onChange={(e) => setAccountName(e.target.value)}
                      placeholder="Enter account holder name"
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-[#27aae2] focus:border-transparent"
                    />
                  </div>
                </>
              )}

              {error && (
                <div className="flex items-start space-x-2 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
                  <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                </div>
              )}

              <button
                onClick={handleNext}
                className="w-full bg-[#27aae2] text-white py-3 rounded-xl font-semibold hover:bg-[#1e8bc3] transition-all shadow-lg"
              >
                Continue
              </button>
            </div>
          )}

          {/* Step 3: Confirm */}
          {step === 'confirm' && (
            <div className="space-y-6">
              <button
                onClick={handleBack}
                className="text-[#27aae2] hover:text-[#1e8bc3] font-semibold text-sm flex items-center"
              >
                ← Back to details
              </button>

              <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6 space-y-4">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Confirm Withdrawal</h3>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">Amount</span>
                    <span className="font-bold text-xl text-gray-900 dark:text-white">
                      Ksh {parseFloat(amount).toLocaleString()}
                    </span>
                  </div>

                  <div className="border-t border-gray-200 dark:border-gray-600 pt-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 dark:text-gray-400">Method</span>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {withdrawMethod === 'mpesa' ? 'M-Pesa' : 'Bank Transfer'}
                      </span>
                    </div>
                  </div>

                  {withdrawMethod === 'mpesa' && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 dark:text-gray-400">Phone Number</span>
                      <span className="font-semibold text-gray-900 dark:text-white">{mpesaPhone}</span>
                    </div>
                  )}

                  {withdrawMethod === 'bank' && (
                    <>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 dark:text-gray-400">Bank</span>
                        <span className="font-semibold text-gray-900 dark:text-white">{bankName}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 dark:text-gray-400">Account Number</span>
                        <span className="font-semibold text-gray-900 dark:text-white">{accountNumber}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 dark:text-gray-400">Account Name</span>
                        <span className="font-semibold text-gray-900 dark:text-white">{accountName}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
                <p className="text-sm text-blue-800 dark:text-blue-300">
                  {withdrawMethod === 'mpesa' 
                    ? '⚡ Your funds will be sent instantly to your M-Pesa number.'
                    : '🏦 Bank transfers typically take 1-3 business days to process.'
                  }
                </p>
              </div>

              <button
                onClick={handleConfirm}
                className="w-full bg-[#27aae2] text-white py-3 rounded-xl font-semibold hover:bg-[#1e8bc3] transition-all shadow-lg"
              >
                Confirm Withdrawal
              </button>
            </div>
          )}

          {/* Step 4: Success */}
          {step === 'success' && (
            <div className="text-center py-8">
              <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                <CheckCircle className="w-12 h-12 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Withdrawal Successful!</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {withdrawMethod === 'mpesa' 
                  ? `Ksh ${parseFloat(amount).toLocaleString()} has been sent to ${mpesaPhone}`
                  : `Ksh ${parseFloat(amount).toLocaleString()} is being processed to ${bankName}`
                }
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {withdrawMethod === 'mpesa' 
                  ? 'Check your M-Pesa messages for confirmation.'
                  : 'You will receive the funds within 1-3 business days.'
                }
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
