import { ShieldAlert, UserCheck, Clock } from 'lucide-react';
import { format } from 'date-fns';

export default function LoanAuditLog({ loan }: { loan: any }) {
  // We extract the justification notes we set up in the backend entity
  const auditEntries = loan.notes?.split('\n').filter((line: string) => line.includes('[REVERSAL]')) || [];

  return (
    <div className="mt-8 bg-slate-50 rounded-xl border border-slate-200 overflow-hidden">
      <div className="bg-slate-200 px-4 py-2 flex items-center gap-2">
        <ShieldAlert className="w-4 h-4 text-slate-700" />
        <span className="text-sm font-bold text-slate-700 uppercase tracking-wider">System Audit Trail</span>
      </div>
      
      <div className="p-4">
        {auditEntries.length === 0 ? (
          <p className="text-sm text-slate-500 italic">No administrative overrides performed on this record.</p>
        ) : (
          <ul className="space-y-4">
            {auditEntries.map((entry: string, idx: number) => (
              <li key={idx} className="flex gap-3 items-start border-l-2 border-red-500 pl-4 py-1">
                <div className="bg-red-100 p-1.5 rounded-full">
                  <UserCheck className="w-4 h-4 text-red-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900">{entry}</p>
                  <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                    <Clock className="w-3 h-3" />
                    <span>Policy [2026-01-10] Admin Override</span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}