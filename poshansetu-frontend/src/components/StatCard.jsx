export function StatCard({ title, value, subtitle, icon: Icon, color = 'indigo' }) {
    const colors = {
        indigo: 'bg-indigo-50 text-indigo-600',
        emerald: 'bg-emerald-50 text-emerald-600',
        amber: 'bg-amber-50 text-amber-600',
        red: 'bg-red-50 text-red-600',
        blue: 'bg-blue-50 text-blue-600',
        purple: 'bg-purple-50 text-purple-600',
    };
    return (
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-sm text-slate-500 font-medium">{title}</p>
                    <p className="text-2xl font-bold text-slate-800 mt-1">{value ?? '—'}</p>
                    {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
                </div>
                {Icon && (
                    <div className={`p-2.5 rounded-xl ${colors[color] || colors.indigo}`}>
                        <Icon size={20} />
                    </div>
                )}
            </div>
        </div>
    );
}
