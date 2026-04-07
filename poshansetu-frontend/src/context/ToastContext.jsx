import { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext(null);

let toastId = 0;

export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([]);

    const showToast = useCallback((message, type = 'info') => {
        const id = ++toastId;
        setToasts((prev) => [...prev, { id, message, type }]);
        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, 4000);
    }, []);

    const dismiss = (id) => setToasts((prev) => prev.filter((t) => t.id !== id));

    const typeStyles = {
        success: 'bg-emerald-500',
        error: 'bg-red-500',
        warning: 'bg-amber-500',
        info: 'bg-blue-500',
    };

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            <div className="fixed bottom-4 right-4 flex flex-col gap-2 z-50">
                {toasts.map((t) => (
                    <div
                        key={t.id}
                        className={`${typeStyles[t.type] || typeStyles.info} text-white px-4 py-3 rounded-xl shadow-lg flex items-center gap-3 min-w-64 max-w-sm animate-fade-in`}
                    >
                        <span className="flex-1 text-sm font-medium">{t.message}</span>
                        <button onClick={() => dismiss(t.id)} className="text-white/70 hover:text-white text-lg leading-none">×</button>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
}

export function useToast() {
    const ctx = useContext(ToastContext);
    if (!ctx) throw new Error('useToast must be used within ToastProvider');
    return ctx;
}
