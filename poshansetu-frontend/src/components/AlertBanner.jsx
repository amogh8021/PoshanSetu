import { useState } from 'react';
import { AlertTriangle, Info, Shield, X } from 'lucide-react';

const typeConfig = {
    warning: { bg: 'bg-amber-50 border-amber-200', text: 'text-amber-800', icon: AlertTriangle, iconColor: 'text-amber-500' },
    danger: { bg: 'bg-red-50 border-red-200', text: 'text-red-800', icon: Shield, iconColor: 'text-red-500' },
    info: { bg: 'bg-blue-50 border-blue-200', text: 'text-blue-800', icon: Info, iconColor: 'text-blue-500' },
};

export function AlertBanner({ type = 'info', message }) {
    const [dismissed, setDismissed] = useState(false);
    if (dismissed || !message) return null;
    const { bg, text, icon: Icon, iconColor } = typeConfig[type] || typeConfig.info;
    return (
        <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${bg} ${text}`}>
            <Icon size={16} className={iconColor} />
            <p className="flex-1 text-sm font-medium">{message}</p>
            <button onClick={() => setDismissed(true)} className="opacity-60 hover:opacity-100">
                <X size={14} />
            </button>
        </div>
    );
}
