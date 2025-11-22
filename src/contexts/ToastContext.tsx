import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { X, CheckCircle, XCircle, AlertCircle, Info } from 'lucide-react';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
    id: string;
    type: ToastType;
    message: string;
    duration?: number;
}

interface ToastContextType {
    showToast: (type: ToastType, message: string, duration?: number) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within ToastProvider');
    }
    return context;
};

const toastConfig = {
    success: {
        bg: 'bg-success-50',
        border: 'border-success-500',
        text: 'text-success-800',
        icon: CheckCircle,
        iconColor: 'text-success-600',
    },
    error: {
        bg: 'bg-danger-50',
        border: 'border-danger-500',
        text: 'text-danger-800',
        icon: XCircle,
        iconColor: 'text-danger-600',
    },
    warning: {
        bg: 'bg-warning-50',
        border: 'border-warning-500',
        text: 'text-warning-800',
        icon: AlertCircle,
        iconColor: 'text-warning-600',
    },
    info: {
        bg: 'bg-primary-50',
        border: 'border-primary-500',
        text: 'text-primary-800',
        icon: Info,
        iconColor: 'text-primary-600',
    },
};

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const removeToast = useCallback((id: string) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, []);

    const showToast = useCallback((type: ToastType, message: string, duration: number = 5000) => {
        const id = Date.now().toString() + Math.random().toString(36);
        const newToast: Toast = { id, type, message, duration };

        setToasts((prev) => [...prev, newToast]);

        if (duration > 0) {
            setTimeout(() => {
                removeToast(id);
            }, duration);
        }
    }, [removeToast]);

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}

            {/* Toast Container */}
            <div className="fixed top-4 right-4 z-[9999] space-y-2 max-w-sm w-full pointer-events-none">
                {toasts.map((toast) => {
                    const config = toastConfig[toast.type];
                    const Icon = config.icon;

                    return (
                        <div
                            key={toast.id}
                            className={`
                                ${config.bg} ${config.border} ${config.text}
                                border-l-4 p-4 rounded-lg shadow-strong
                                flex items-start gap-3
                                animate-slide-down pointer-events-auto
                            `}
                            role="alert"
                        >
                            <Icon size={20} className={`flex-shrink-0 ${config.iconColor}`} />
                            <p className="flex-1 text-sm font-medium">{toast.message}</p>
                            <button
                                onClick={() => removeToast(toast.id)}
                                className={`flex-shrink-0 ${config.iconColor} hover:opacity-70 transition-opacity cursor-pointer`}
                                aria-label="Close"
                            >
                                <X size={18} />
                            </button>
                        </div>
                    );
                })}
            </div>
        </ToastContext.Provider>
    );
};
