// src/app/checkout/page.tsx - Checkout Process
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  CreditCard, 
  Smartphone, 
  Shield, 
  Clock,
  CheckCircle,
  ArrowLeft,
  AlertCircle,
  Lock,
  User,
  Mail,
  Phone
} from 'lucide-react';
import { Header } from '@/components/Header';

interface PaymentMethod {
  id: string;
  name: string;
  type: 'card' | 'mobile' | 'bank';
  icon: React.ReactNode;
  fees: number; // percentage
  processingTime: string;
  available: boolean;
}

const paymentMethods: PaymentMethod[] = [
  {
    id: 'mpesa',
    name: 'M-Pesa',
    type: 'mobile',
    icon: <div className="w-6 h-6 bg-green-500 rounded flex items-center justify-center text-white text-xs font-bold">M</div>,
    fees: 0,
    processingTime: 'Instant',
    available: true
  },
  {
    id: 'pesapal',
    name: 'Pesapal (Cards)',
    type: 'card',
    icon: <CreditCard className="w-6 h-6 text-blue-600" />,
    fees: 2.5,
    processingTime: 'Instant',
    available: true
  },
  {
    id: 'airtel',
    name: 'Airtel Money',
    type: 'mobile',
    icon: <div className="w-6 h-6 bg-red-500 rounded flex items-center justify-center text-white text-xs font-bold">A</div>,
    fees: 0,
    processingTime: 'Instant',
    available: true
  },
  {
    id: 'bank',
    name: 'Bank Transfer',
    type: 'bank',
    icon: <div className="w-6 h-6 bg-gray-600 rounded flex items-center justify-center text-white text-xs">🏦</div>,
    fees: 0,
    processingTime: '1-2 hours',
    available: false
  }
];

export default function CheckoutPage() {
  const [step, setStep] = useState<'info' | 'payment' | 'processing' | 'success'>('info');
  const [selectedPayment, setSelectedPayment] = useState<string>('');
  const [customerInfo, setCustomerInfo] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: ''
  });
  const [paymentData, setPaymentData] = useState({
    phoneNumber: '',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: ''
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Mock order data
  const orderData = {
    items: [
      {
        eventTitle: 'Sauti Sol Live in Concert',
        ticketType: 'Regular',
        quantity: 2,
        price: 2500,
        total: 5000
      }
    ],
    subtotal: 5000,
    serviceFee: 250,
    total: 5250
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES'
    }).format(price);
  };

  const validateCustomerInfo = () => {
    const newErrors: Record<string, string> = {};
    
    if (!customerInfo.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!customerInfo.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!customerInfo.email.trim()) newErrors.email = 'Email is required';
    if (!/\S+@\S+\.\S+/.test(customerInfo.email)) newErrors.email = 'Email is invalid';
    if (!customerInfo.phone.trim()) newErrors.phone = 'Phone number is required';
    if (!/^\+254\d{9}$/.test(customerInfo.phone)) newErrors.phone = 'Phone number must be in format +254XXXXXXXXX';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validatePayment = () => {
    const newErrors: Record<string, string> = {};
    const method = paymentMethods.find(p => p.id === selectedPayment);
    
    if (!selectedPayment) {
      newErrors.payment = 'Please select a payment method';
    } else if (method?.type === 'mobile') {
      if (!paymentData.phoneNumber.trim()) {
        newErrors.phoneNumber = 'Phone number is required';
      } else if (!/^\+254\d{9}$/.test(paymentData.phoneNumber)) {
        newErrors.phoneNumber = 'Phone number must be in format +254XXXXXXXXX';
      }
    } else if (method?.type === 'card') {
      if (!paymentData.cardNumber.trim()) newErrors.cardNumber = 'Card number is required';
      if (!paymentData.expiryDate.trim()) newErrors.expiryDate = 'Expiry date is required';
      if (!paymentData.cvv.trim()) newErrors.cvv = 'CVV is required';
      if (!paymentData.cardholderName.trim()) newErrors.cardholderName = 'Cardholder name is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleContinueToPayment = () => {
    if (validateCustomerInfo()) {
      setStep('payment');
    }
  };

  const handlePayment = async () => {
    if (!validatePayment()) return;
    
    setIsProcessing(true);
    setStep('processing');
    
    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false);
      setStep('success');
    }, 3000);
  };

  const CustomerInfoStep = () => (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Customer Information</h2>
        
        <div className="grid md:grid-cols-2 gap-4">
          <div className="form-group">
            <label className="form-label">First Name</label>
            <input
              type="text"
              value={customerInfo.firstName}
              onChange={(e) => setCustomerInfo(prev => ({ ...prev, firstName: e.target.value }))}
              className={`form-input ${errors.firstName ? 'border-red-500' : ''}`}
              placeholder="John"
            />
            {errors.firstName && <p className="form-error">{errors.firstName}</p>}
          </div>
          
          <div className="form-group">
            <label className="form-label">Last Name</label>
            <input
              type="text"
              value={customerInfo.lastName}
              onChange={(e) => setCustomerInfo(prev => ({ ...prev, lastName: e.target.value }))}
              className={`form-input ${errors.lastName ? 'border-red-500' : ''}`}
              placeholder="Doe"
            />
            {errors.lastName && <p className="form-error">{errors.lastName}</p>}
          </div>
          
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="email"
                value={customerInfo.email}
                onChange={(e) => setCustomerInfo(prev => ({ ...prev, email: e.target.value }))}
                className={`form-input pl-10 ${errors.email ? 'border-red-500' : ''}`}
                placeholder="john.doe@example.com"
              />
            </div>
            {errors.email && <p className="form-error">{errors.email}</p>}
          </div>
          
          <div className="form-group">
            <label className="form-label">Phone Number</label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="tel"
                value={customerInfo.phone}
                onChange={(e) => setCustomerInfo(prev => ({ ...prev, phone: e.target.value }))}
                className={`form-input pl-10 ${errors.phone ? 'border-red-500' : ''}`}
                placeholder="+254700000000"
              />
            </div>
            {errors.phone && <p className="form-error">{errors.phone}</p>}
          </div>
        </div>
      </div>
    </div>
  );

  const PaymentStep = () => (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Payment Method</h2>
        
        <div className="space-y-3 mb-6">
          {paymentMethods.map(method => (
            <div
              key={method.id}
              className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                !method.available 
                  ? 'bg-gray-50 border-gray-200 cursor-not-allowed opacity-50'
                  : selectedPayment === method.id
                    ? 'border-purple-600 bg-purple-50'
                    : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => method.available && setSelectedPayment(method.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {method.icon}
                  <div>
                    <h3 className="font-medium text-gray-900">{method.name}</h3>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span>Fee: {method.fees}%</span>
                      <span>• {method.processingTime}</span>
                    </div>
                  </div>
                </div>
                {!method.available && (
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                    Coming Soon
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
        
        {selectedPayment && (
          <div className="border-t pt-6">
            {paymentMethods.find(p => p.id === selectedPayment)?.type === 'mobile' && (
              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <input
                  type="tel"
                  value={paymentData.phoneNumber}
                  onChange={(e) => setPaymentData(prev => ({ ...prev, phoneNumber: e.target.value }))}
                  className={`form-input ${errors.phoneNumber ? 'border-red-500' : ''}`}
                  placeholder="+254700000000"
                />
                {errors.phoneNumber && <p className="form-error">{errors.phoneNumber}</p>}
              </div>
            )}
            
            {paymentMethods.find(p => p.id === selectedPayment)?.type === 'card' && (
              <div className="space-y-4">
                <div className="form-group">
                  <label className="form-label">Card Number</label>
                  <input
                    type="text"
                    value={paymentData.cardNumber}
                    onChange={(e) => setPaymentData(prev => ({ ...prev, cardNumber: e.target.value }))}
                    className={`form-input ${errors.cardNumber ? 'border-red-500' : ''}`}
                    placeholder="1234 5678 9012 3456"
                    maxLength={19}
                  />
                  {errors.cardNumber && <p className="form-error">{errors.cardNumber}</p>}
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="form-group">
                    <label className="form-label">Expiry Date</label>
                    <input
                      type="text"
                      value={paymentData.expiryDate}
                      onChange={(e) => setPaymentData(prev => ({ ...prev, expiryDate: e.target.value }))}
                      className={`form-input ${errors.expiryDate ? 'border-red-500' : ''}`}
                      placeholder="MM/YY"
                      maxLength={5}
                    />
                    {errors.expiryDate && <p className="form-error">{errors.expiryDate}</p>}
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">CVV</label>
                    <input
                      type="text"
                      value={paymentData.cvv}
                      onChange={(e) => setPaymentData(prev => ({ ...prev, cvv: e.target.value }))}
                      className={`form-input ${errors.cvv ? 'border-red-500' : ''}`}
                      placeholder="123"
                      maxLength={4}
                    />
                    {errors.cvv && <p className="form-error">{errors.cvv}</p>}
                  </div>
                </div>
                
                <div className="form-group">
                  <label className="form-label">Cardholder Name</label>
                  <input
                    type="text"
                    value={paymentData.cardholderName}
                    onChange={(e) => setPaymentData(prev => ({ ...prev, cardholderName: e.target.value }))}
                    className={`form-input ${errors.cardholderName ? 'border-red-500' : ''}`}
                    placeholder="John Doe"
                  />
                  {errors.cardholderName && <p className="form-error">{errors.cardholderName}</p>}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );

  const ProcessingStep = () => (
    <div className="max-w-md mx-auto text-center">
      <div className="bg-white rounded-xl border border-gray-200 p-8">
        <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Processing Payment</h2>
        <p className="text-gray-600 mb-6">
          Please wait while we process your payment. This may take a few moments.
        </p>
        <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
          <Lock className="w-4 h-4" />
          <span>Secure payment processing</span>
        </div>
      </div>
    </div>
  );

  const SuccessStep = () => (
    <div className="max-w-md mx-auto text-center">
      <div className="bg-white rounded-xl border border-gray-200 p-8">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">Payment Successful!</h2>
        <p className="text-gray-600 mb-6">
          Your tickets have been purchased successfully. You'll receive a confirmation email shortly.
        </p>
        <div className="space-y-3">
          <Link href="/tickets" className="btn btn-primary w-full">
            View My Tickets
          </Link>
          <Link href="/events" className="btn btn-ghost w-full">
            Browse More Events
          </Link>
        </div>
      </div>
    </div>
  );

  const OrderSummary = () => (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h3>
      
      <div className="space-y-3 mb-4">
        {orderData.items.map((item, index) => (
          <div key={index} className="flex justify-between">
            <div>
              <div className="font-medium text-gray-900">{item.eventTitle}</div>
              <div className="text-sm text-gray-600">{item.ticketType} × {item.quantity}</div>
            </div>
            <div className="font-medium">{formatPrice(item.total)}</div>
          </div>
        ))}
      </div>
      
      <div className="border-t border-gray-200 pt-4 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Subtotal</span>
          <span>{formatPrice(orderData.subtotal)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Service Fee</span>
          <span>{formatPrice(orderData.serviceFee)}</span>
        </div>
        <div className="flex justify-between text-lg font-semibold pt-2 border-t border-gray-200">
          <span>Total</span>
          <span className="text-purple-600">{formatPrice(orderData.total)}</span>
        </div>
      </div>
      
      <div className="mt-6 p-3 bg-blue-50 rounded-lg">
        <div className="flex items-start space-x-2">
          <Shield className="w-4 h-4 text-blue-600 mt-0.5" />
          <div className="text-xs text-blue-700">
            <p className="font-medium mb-1">Secure Payment</p>
            <p>Your payment is protected with industry-standard encryption.</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Header variant="minimal" title="Checkout" showBackButton={true} />

      <div className="container py-6">
        {/* Progress Steps */}
        <div className="max-w-2xl mx-auto mb-8">
          <div className="flex items-center justify-between">
            {['Customer Info', 'Payment', 'Complete'].map((stepName, index) => {
              const stepNumber = index + 1;
              const isActive = 
                (step === 'info' && stepNumber === 1) ||
                (step === 'payment' && stepNumber === 2) ||
                (['processing', 'success'].includes(step) && stepNumber === 3);
              const isCompleted = 
                (step !== 'info' && stepNumber === 1) ||
                (['processing', 'success'].includes(step) && stepNumber <= 2);

              return (
                <div key={stepName} className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    isCompleted 
                      ? 'bg-green-600 text-white' 
                      : isActive 
                        ? 'bg-purple-600 text-white' 
                        : 'bg-gray-200 text-gray-600'
                  }`}>
                    {isCompleted ? <CheckCircle className="w-5 h-5" /> : stepNumber}
                  </div>
                  <span className={`ml-2 text-sm font-medium ${
                    isActive ? 'text-purple-600' : isCompleted ? 'text-green-600' : 'text-gray-500'
                  }`}>
                    {stepName}
                  </span>
                  {index < 2 && (
                    <div className={`w-16 h-0.5 mx-4 ${
                      isCompleted ? 'bg-green-600' : 'bg-gray-200'
                    }`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {step === 'info' && <CustomerInfoStep />}
            {step === 'payment' && <PaymentStep />}
            {step === 'processing' && <ProcessingStep />}
            {step === 'success' && <SuccessStep />}
          </div>

          {step !== 'success' && (
            <div className="lg:col-span-1">
              <div className="sticky top-6">
                <OrderSummary />
                
                {step === 'info' && (
                  <button
                    onClick={handleContinueToPayment}
                    className="btn btn-primary w-full btn-lg mt-6"
                  >
                    Continue to Payment
                  </button>
                )}
                
                {step === 'payment' && (
                  <button
                    onClick={handlePayment}
                    disabled={!selectedPayment}
                    className="btn btn-primary w-full btn-lg mt-6"
                  >
                    <Lock className="w-5 h-5 mr-2" />
                    Complete Payment
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}