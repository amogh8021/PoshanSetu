export function LoadingSpinner({ size = 'md', message }) {
    const sizes = { sm: 'w-5 h-5', md: 'w-8 h-8', lg: 'w-12 h-12' };
    return (
        <div className="flex flex-col items-center justify-center gap-3 py-12">
            <div className={`${sizes[size]} border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin`} />
            {message && <p className="text-sm text-slate-500">{message}</p>}
        </div>
    );
}

export function EmptyState({ icon: Icon, title, subtitle, action }) {
    return (
        <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
            {Icon && (
                <div className="p-4 bg-slate-100 rounded-full">
                    <Icon size={32} className="text-slate-400" />
                </div>
            )}
            <p className="text-base font-semibold text-slate-600">{title}</p>
            {subtitle && <p className="text-sm text-slate-400 max-w-xs">{subtitle}</p>}
            {action}
        </div>
    );
}
