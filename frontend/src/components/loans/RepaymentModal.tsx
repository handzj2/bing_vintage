'use client';

import { useState } from 'react';
import Button from '@/components/ui/Button';
import { Lock, CheckCircle, Shield } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface PaymentRequest {
  loan_id: string;
  amount: number;
  payment_method: 'cash' | 'MTNmomo' | 'bank';
  justification: string;
  recorded_by: string;
}

export default function RepaymentModal({ loan, onSave, onClose, user }: { 
  loan: any, 
  onSave: Function, 
  onClose: () => void,
  user: { id: string }
}) {
  const [amount, setAmount] = useState<string>('');
  const [method, setMethod] = useState<'cash' | 'momo' | 'bank'>('cash');
  const [justification, setJustification] = useState<string>(''); // New state for audit
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleSubmit = async () => {
    if (!amount || Number(amount) <= 0) {
      toast.error("Enter a valid amount");
      return;
    }
    
    if (!justification || justification.length < 5) {
      toast.error("Please provide a justification (min 5 characters) for the audit log.");
      return;
    }

    setIsSubmitting(true);
    try {
      const paymentData: PaymentRequest = {
        loan_id: loan.id,
        amount: Number(amount),
        payment_method: method,
        justification: justification, // Policy [2026-01-10] requirement
        recorded_by: user.id
      };

      const result = await onSave(paymentData);
      if (result.success) {
        toast.success("Payment recorded and audited");
        onClose();
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to record payment");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-2xl border border-slate-200">
      <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
        <CheckCircle className="text-green-600" /> Record Payment
      </h3>
      
      <div className="space-y-4">
        {/* Amount Input */}
        <div>
          <label className="text-xs font-bold text-slate-500 uppercase">Amount (UGX)</label>
          <input 
            type="number" 
            className="w-full p-4 text-2xl font-mono border rounded-xl focus:ring-2 focus:ring-blue-500"
            placeholder="e.g. 50000"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </div>

        {/* Payment Method Selection */}
        <div>
          <label className="text-xs font-bold text-slate-500 uppercase">Payment Method</label>
          <div className="grid grid-cols-3 gap-2 mt-2">
            <button
              type="button"
              onClick={() => setMethod('cash')}
              className={`p-3 rounded-lg border ${method === 'cash' ? 'bg-blue-50 border-blue-300 text-blue-700' : 'border-gray-200 hover:bg-gray-50'}`}
            >
              💵 Cash
            </button>
            <button
              type="button"
              onClick={() => setMethod('momo')}
              className={`p-3 rounded-lg border ${method === 'momo' ? 'bg-blue-50 border-blue-300 text-blue-700' : 'border-gray-200 hover:bg-gray-50'}`}
            >
              📱 MoMo
            </button>
            <button
              type="button"
              onClick={() => setMethod('bank')}
              className={`p-3 rounded-lg border ${method === 'bank' ? 'bg-blue-50 border-blue-300 text-blue-700' : 'border-gray-200 hover:bg-gray-50'}`}
            >
              🏦 Bank
            </button>
          </div>
        </div>

        {/* NEW: GOVERNANCE BLOCK */}
        <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl space-y-3">
          <div className="flex items-center gap-2 text-blue-800 font-bold text-xs uppercase">
            <Shield className="w-4 h-4" /> Policy [2026-01-10] Audit Trail
          </div>
          
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-blue-600 uppercase">
              Mandatory Justification
            </label>
            <textarea
              value={justification}
              onChange={(e) => setJustification(e.target.value)}
              placeholder="e.g., Weekly installment for Jan Week 2 - Paid via MoMo"
              className="w-full p-3 text-sm border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
              rows={3}
              required
            />
            <div className="flex items-start gap-2 mt-1">
              <Lock className="w-3 h-3 text-blue-400 mt-0.5" />
              <p className="text-[10px] text-blue-400 italic leading-tight">
                This justification is immutable and will be permanently attached to the loan history.
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button
            type="button"
            onClick={onClose}
            className="flex-1 bg-gray-100 text-gray-700 hover:bg-gray-200 py-4"
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          
          <Button 
            type="button"
            onClick={handleSubmit}
            className="flex-1 bg-blue-600 hover:bg-blue-700 py-4 text-lg"
            disabled={isSubmitting || !amount || Number(amount) <= 0 || !justification || justification.length < 5}
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Auditing & Saving...
              </span>
            ) : (
              "Confirm & Issue Receipt"
            )}
          </Button>
        </div>

        <p className="text-[10px] text-center text-slate-400">
          <Lock className="w-3 h-3 inline mr-1" />
          Transactions are final. Only Admin can reverse. [cite: 2026-01-10]
        </p>
      </div>
    </div>
  );
}