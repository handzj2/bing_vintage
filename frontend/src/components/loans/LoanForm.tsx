// src/components/loan/LoanForm.tsx
'use client';

import { useEffect, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { 
  DollarSign, 
  Percent, 
  Calendar, 
  FileText, 
  CreditCard,
  Clock,
  Calculator,
  AlertCircle 
} from 'lucide-react';

// Import from the schema file we just fixed
import { 
  calculateEMI, 
  calculateTotalInterest,
  calculateTotalAmount,
  type LoanType // Use 'type' for TS best practices
} from '@/lib/validations/loan-schema';

interface LoanFormProps {
  loanType: LoanType;
  selectedBikeValue?: number;
}

export default function LoanForm({ loanType, selectedBikeValue }: LoanFormProps) {
  const { register, watch, setValue, formState: { errors } } = useFormContext();
  
  // Watch form values for real-time calculations
  const loanAmount = watch('loan_amount') || 0;
  const interestRate = watch('interest_rate') || 0;
  const periodMonths = watch('period_months') || 0;
  const disbursementMethod = watch('disbursement_method');
  
  // State for calculated values
  const [emi, setEmi] = useState(0);
  const [totalInterest, setTotalInterest] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);
  
  // Calculate EMI when values change
  useEffect(() => {
    if (loanAmount > 0 && interestRate > 0 && periodMonths > 0) {
      const calculatedEMI = calculateEMI(Number(loanAmount), Number(interestRate), Number(periodMonths));
      const calculatedTotalAmount = calculateTotalAmount(calculatedEMI, Number(periodMonths));
      const calculatedTotalInterest = calculateTotalInterest(calculatedTotalAmount, Number(loanAmount));
      
      setEmi(calculatedEMI);
      setTotalInterest(calculatedTotalInterest);
      setTotalAmount(calculatedTotalAmount);
    }
  }, [loanAmount, interestRate, periodMonths]);
  
  // Auto-fill loan amount if bike is selected
  useEffect(() => {
    if (loanType === 'bike' && selectedBikeValue && selectedBikeValue > 0) {
      setValue('loan_amount', selectedBikeValue);
    }
  }, [loanType, selectedBikeValue, setValue]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Loan Terms Section */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <FileText className="w-5 h-5 mr-2 text-blue-600" />
          Loan Terms
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Loan Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <div className="flex items-center">
                <DollarSign className="w-4 h-4 mr-1" />
                Loan Amount (KES)
              </div>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                KES
              </span>
              <input
                type="number"
                {...register('loan_amount')}
                className={`pl-12 pr-4 py-3 w-full border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.loan_amount ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Enter loan amount"
                step="100"
                disabled={loanType === 'bike' && selectedBikeValue && selectedBikeValue > 0}
              />
            </div>
            {errors.loan_amount && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {errors.loan_amount.message as string}
              </p>
            )}
            {loanType === 'bike' && selectedBikeValue && selectedBikeValue > 0 && (
              <p className="mt-1 text-sm text-blue-600">
                Amount set to bike value
              </p>
            )}
          </div>

          {/* Interest Rate */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <div className="flex items-center">
                <Percent className="w-4 h-4 mr-1" />
                Interest Rate (%)
              </div>
            </label>
            <div className="relative">
              <input
                type="number"
                step="0.1"
                {...register('interest_rate')}
                className={`pl-4 pr-4 py-3 w-full border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.interest_rate ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="e.g., 12.5"
              />
              <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                %
              </span>
            </div>
            {errors.interest_rate && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {errors.interest_rate.message as string}
              </p>
            )}
          </div>

          {/* Period in Months */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <div className="flex items-center">
                <Clock className="w-4 h-4 mr-1" />
                Loan Term (Months)
              </div>
            </label>
            <input
              type="number"
              {...register('period_months')}
              className={`px-4 py-3 w-full border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.period_months ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="e.g., 24"
            />
            {errors.period_months && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {errors.period_months.message as string}
              </p>
            )}
          </div>

          {/* Start Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-1" />
                Start Date
              </div>
            </label>
            <input
              type="date"
              {...register('start_date')}
              className={`px-4 py-3 w-full border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.start_date ? 'border-red-300' : 'border-gray-300'
              }`}
            />
            {errors.start_date && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {errors.start_date.message as string}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Additional Information Section */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Additional Information
        </h3>
        
        <div className="space-y-6">
          {/* Purpose */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Purpose of Loan
            </label>
            <textarea
              {...register('purpose')}
              rows={3}
              className={`px-4 py-3 w-full border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.purpose ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Describe the purpose of this loan..."
            />
            {errors.purpose && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {errors.purpose.message as string}
              </p>
            )}
          </div>

          {/* Disbursement Method */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <div className="flex items-center">
                <CreditCard className="w-4 h-4 mr-1" />
                Disbursement Method
              </div>
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {['mpesa', 'bank', 'cash', 'cheque'].map((method) => (
                <label
                  key={method}
                  className={`
                    flex items-center justify-center p-4 border rounded-lg cursor-pointer transition-colors
                    ${disbursementMethod === method 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-300 hover:border-gray-400'
                    }
                  `}
                >
                  <input
                    type="radio"
                    value={method}
                    {...register('disbursement_method')}
                    className="sr-only"
                  />
                  <span className="text-sm font-medium capitalize">
                    {method}
                  </span>
                </label>
              ))}
            </div>
            {errors.disbursement_method && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {errors.disbursement_method.message as string}
              </p>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes (Optional)
            </label>
            <textarea
              {...register('notes')}
              rows={2}
              className="px-4 py-3 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Any additional notes or comments..."
            />
          </div>
        </div>
      </div>

      {/* EMI Calculation Section */}
      {(loanAmount > 0 && interestRate > 0 && periodMonths > 0) && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Calculator className="w-5 h-5 mr-2 text-blue-600" />
            Loan Calculation Summary
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="text-sm font-medium text-gray-600">Monthly EMI</div>
              <div className="text-2xl font-bold text-blue-600 mt-1">
                {formatCurrency(emi)}
              </div>
              <div className="text-xs text-gray-500 mt-1">per month</div>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="text-sm font-medium text-gray-600">Total Interest</div>
              <div className="text-2xl font-bold text-purple-600 mt-1">
                {formatCurrency(totalInterest)}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {loanAmount > 0 ? ((totalInterest / Number(loanAmount)) * 100).toFixed(1) : '0'}% of principal
              </div>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="text-sm font-medium text-gray-600">Total Payment</div>
              <div className="text-2xl font-bold text-green-600 mt-1">
                {formatCurrency(totalAmount)}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Principal + Interest
              </div>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="text-sm font-medium text-gray-600">Loan Term</div>
              <div className="text-2xl font-bold text-indigo-600 mt-1">
                {periodMonths}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {Number(periodMonths) >= 12 
                  ? `${Math.floor(Number(periodMonths) / 12)} years ${Number(periodMonths) % 12} months` 
                  : `${periodMonths} months`
                }
              </div>
            </div>
          </div>
          
          <div className="mt-4 text-sm text-gray-600">
            <p className="flex items-center">
              <AlertCircle className="w-4 h-4 mr-1 text-blue-500" />
              EMI calculated using reducing balance method. Rates are subject to change.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}