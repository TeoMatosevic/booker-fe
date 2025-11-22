import React from 'react';
import { AlertCircle, CheckCircle, Info, XCircle, X } from 'lucide-react';

interface AlertProps {
    variant?: 'success' | 'error' | 'warning' | 'info';
    title?: string;
    message: React.ReactNode;
    onDismiss?: () => void;
    className?: string;
}

const variantConfig = {
    success: {
        containerStyle: {
            backgroundColor: '#f0fdf4',
            borderColor: '#bbf7d0',
            color: '#166534',
        },
        iconColor: '#22c55e',
        Icon: CheckCircle,
    },
    error: {
        containerStyle: {
            backgroundColor: '#fef2f2',
            borderColor: '#fecaca',
            color: '#991b1b',
        },
        iconColor: '#ef4444',
        Icon: XCircle,
    },
    warning: {
        containerStyle: {
            backgroundColor: '#fffbeb',
            borderColor: '#fed7aa',
            color: '#92400e',
        },
        iconColor: '#f59e0b',
        Icon: AlertCircle,
    },
    info: {
        containerStyle: {
            backgroundColor: '#eef2ff',
            borderColor: '#c7d2fe',
            color: '#3730a3',
        },
        iconColor: '#4f46e5',
        Icon: Info,
    },
};

export const Alert: React.FC<AlertProps> = ({
    variant = 'info',
    title,
    message,
    onDismiss,
    className = '',
}) => {
    const config = variantConfig[variant];
    const Icon = config.Icon;

    return (
        <div
            style={config.containerStyle}
            className={`
                flex items-start gap-3 p-4 rounded-lg border
                ${className}
            `}
            role="alert"
        >
            <Icon size={20} style={{ color: config.iconColor }} className="flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
                {title && <p className="font-semibold text-sm mb-1">{title}</p>}
                <div className="text-sm">{message}</div>
            </div>
            {onDismiss && (
                <button
                    onClick={onDismiss}
                    style={{ color: config.iconColor }}
                    className="flex-shrink-0 p-0.5 rounded hover:bg-black/5 transition-colors cursor-pointer"
                    aria-label="Dismiss"
                >
                    <X size={18} />
                </button>
            )}
        </div>
    );
};
