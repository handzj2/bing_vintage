// src/components/loan/LoanTypeSelector.tsx
'use client';

import { Bike, DollarSign, Home, AlertCircle } from 'lucide-react';
import { LoanType } from '@/lib/validations/loan-schema';

interface LoanTypeSelectorProps {
  selectedType: LoanType;
  onTypeChange: (type: LoanType) => void;
}

const loanTypes = [
  {
    id: 'bike' as LoanType,
    label: 'Bike Loan',
    description: 'Motorcycle financing',
    icon: Bike,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    hoverColor: 'hover:border-blue-400',
  },
  {
    id: 'cash' as LoanType,
    label: 'Cash Loan',
    description: 'Personal cash advance',
    icon: DollarSign,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    hoverColor: 'hover:border-green-400',
  },
  {
    id: 'asset' as LoanType,
    label: 'Asset Loan',
    description: 'Equipment or vehicle',
    icon: Home,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    hoverColor: 'hover:border-purple-400',
  },
  {
    id: 'emergency' as LoanType,
    label: 'Emergency Loan',
    description: 'Quick disbursement',
    icon: AlertCircle,
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    hoverColor: 'hover:border-red-400',
  },
];

export default function LoanTypeSelector({ 
  selectedType, 
  onTypeChange 
}: LoanTypeSelectorProps) {
  return (
    <div className="mb-8">
      <h3 className="text-sm font-semibold uppercase text-gray-500 mb-4">
        Select Product Type
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {loanTypes.map((type) => {
          const Icon = type.icon;
          const isSelected = selectedType === type.id;
          
          return (
            <button
              key={type.id}
              type="button"
              onClick={() => onTypeChange(type.id)}
              className={`
                p-6 border-2 rounded-xl transition-all duration-200 
                ${isSelected ? type.bgColor : 'bg-white'}
                ${isSelected ? 'border-gray-300' : type.borderColor}
                ${isSelected ? 'ring-2 ring-offset-2 ring-gray-300' : ''}
                ${type.hoverColor}
                flex flex-col items-center justify-center
                hover:shadow-md
              `}
            >
              <Icon className={`w-10 h-10 mb-3 ${type.color}`} />
              <span className={`font-bold text-lg mb-1 ${type.color}`}>
                {type.label}
              </span>
              <span className="text-sm text-gray-600 text-center">
                {type.description}
              </span>
              
              {isSelected && (
                <div className="mt-3">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    Selected
                  </span>
                </div>
              )}
            </button>
          );
        })}
      </div>
      
      {selectedType && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center">
            {loanTypes.find(t => t.id === selectedType)?.icon && (
              React.createElement(loanTypes.find(t => t.id === selectedType)!.icon, {
                className: `w-5 h-5 mr-2 ${loanTypes.find(t => t.id === selectedType)?.color}`
              })
            )}
            <span className="text-sm font-medium">
              {loanTypes.find(t => t.id === selectedType)?.label} selected. 
              {selectedType === 'bike' && ' You will need to select a motorcycle.'}
              {selectedType === 'cash' && ' No asset collateral required.'}
              {selectedType === 'asset' && ' Other asset will be used as collateral.'}
              {selectedType === 'emergency' && ' Quick processing with higher interest rate.'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}