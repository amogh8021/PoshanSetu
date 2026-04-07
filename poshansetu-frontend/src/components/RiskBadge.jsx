export function RiskBadge({ level }) {
    const styles = {
        Low: 'bg-emerald-100 text-emerald-800',
        Normal: 'bg-emerald-100 text-emerald-800',
        NORMAL: 'bg-emerald-100 text-emerald-800',
        Medium: 'bg-amber-100 text-amber-800',
        Moderate: 'bg-amber-100 text-amber-800',
        MODERATE: 'bg-amber-100 text-amber-800',
        High: 'bg-red-100 text-red-800',
        Severe: 'bg-red-100 text-red-800',
        SEVERE: 'bg-red-100 text-red-800',
        HIGH: 'bg-red-100 text-red-800',
    };
    const dots = {
        Low: 'bg-emerald-500', Normal: 'bg-emerald-500', NORMAL: 'bg-emerald-500',
        Medium: 'bg-amber-500', Moderate: 'bg-amber-500', MODERATE: 'bg-amber-500',
        High: 'bg-red-500', Severe: 'bg-red-500', SEVERE: 'bg-red-500', HIGH: 'bg-red-500',
    };
    const cls = styles[level] || 'bg-slate-100 text-slate-700';
    const dot = dots[level] || 'bg-slate-400';
    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${cls}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
            {level || 'Unknown'}
        </span>
    );
}
