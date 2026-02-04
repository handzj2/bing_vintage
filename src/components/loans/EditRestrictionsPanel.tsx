// components/loan/EditRestrictionsPanel.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { InfoIcon, LockIcon, CheckCircleIcon } from 'lucide-react';

interface EditRestrictionsPanelProps {
  loan: any;
  editableFields: string[];
}

export default function EditRestrictionsPanel({ loan, editableFields }: EditRestrictionsPanelProps) {
  const getStatusDescription = () => {
    switch (loan.status) {
      case 'pending_approval':
        return 'Loan is awaiting approval. Most fields can be edited.';
      case 'approved':
        return 'Loan is approved but not disbursed. Limited edits allowed.';
      case 'disbursed':
        return 'Loan has been disbursed. Only minor edits allowed.';
      case 'active':
        return 'Loan is active with ongoing payments. Very limited edits.';
      case 'closed':
        return 'Loan is closed. No edits allowed.';
      case 'rejected':
      case 'cancelled':
        return 'Loan is rejected/cancelled. No edits allowed.';
      default:
        return '';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <LockIcon className="w-5 h-5" />
          Edit Restrictions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-3 bg-blue-50 rounded-lg">
          <div className="flex items-start gap-2">
            <InfoIcon className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <p className="font-medium text-blue-900">Status: {loan.status}</p>
              <p className="text-sm text-blue-700 mt-1">{getStatusDescription()}</p>
            </div>
          </div>
        </div>

        <div>
          <h4 className="font-medium text-gray-900 mb-2">Editable Fields ({editableFields.length})</h4>
          <div className="flex flex-wrap gap-2">
            {editableFields.length > 0 ? (
              editableFields.map((field) => (
                <span
                  key={field}
                  className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full flex items-center gap-1"
                >
                  <CheckCircleIcon className="w-3 h-3" />
                  {field.replace('_', ' ')}
                </span>
              ))
            ) : (
              <p className="text-gray-500 text-sm">No fields are editable in current status.</p>
            )}
          </div>
        </div>

        <div className="pt-4 border-t">
          <h4 className="font-medium text-gray-900 mb-2">Restrictions Summary</h4>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 mt-1.5 rounded-full bg-gray-400"></div>
              <span>Borrower cannot be changed after creation</span>
            </li>
            <li className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 mt-1.5 rounded-full bg-gray-400"></div>
              <span>Loan amount can only be edited before disbursement</span>
            </li>
            <li className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 mt-1.5 rounded-full bg-gray-400"></div>
              <span>Interest rate changes may affect existing payments</span>
            </li>
            <li className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 mt-1.5 rounded-full bg-gray-400"></div>
              <span>All changes are logged for audit purposes</span>
            </li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}