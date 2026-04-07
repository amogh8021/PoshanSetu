import { format } from 'date-fns';

const statusColor = {
    DONE: 'bg-emerald-500',
    MISSED: 'bg-red-500',
    PENDING: 'bg-slate-300',
};
const statusText = {
    DONE: 'text-emerald-700',
    MISSED: 'text-red-700',
    PENDING: 'text-slate-500',
};

export function VaccineTimeline({ vaccinations = [] }) {
    if (!vaccinations.length)
        return <p className="text-sm text-slate-400">No vaccination records available.</p>;

    return (
        <div className="relative">
            <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-slate-200" />
            <div className="space-y-4">
                {vaccinations.map((v, i) => (
                    <div key={i} className="flex items-start gap-4 pl-8 relative">
                        <span
                            className={`absolute left-1.5 top-1.5 w-3 h-3 rounded-full border-2 border-white shadow ${statusColor[v.status] || statusColor.PENDING}`}
                        />
                        <div className="flex-1 bg-slate-50 rounded-xl p-3 border border-slate-100">
                            <div className="flex justify-between items-start">
                                <p className="text-sm font-semibold text-slate-800">{v.vaccineName}</p>
                                <span className={`text-xs font-medium ${statusText[v.status] || statusText.PENDING}`}>
                                    {v.status}
                                </span>
                            </div>
                            <p className="text-xs text-slate-400 mt-0.5">
                                {v.status === 'DONE' && v.administeredDate 
                                    ? `Administered: ${format(new Date(v.administeredDate), 'MMM d, yyyy')}`
                                    : (v.scheduledDate ? `Scheduled: ${format(new Date(v.scheduledDate), 'MMM d, yyyy')}` : '—')}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
