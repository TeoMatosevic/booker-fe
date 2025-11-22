import React from 'react';
import { Spinner } from './Spinner';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'success';
    size?: 'sm' | 'md' | 'lg';
    isLoading?: boolean;
    icon?: React.ReactNode;
    children: React.ReactNode;
}

const variantStyles = {
    primary: {
        base: {
            backgroundColor: '#4f46e5',
            color: 'white',
        },
        hover: '#4338ca',
        disabled: '#a5b4fc',
    },
    secondary: {
        base: {
            backgroundColor: '#f3f4f6',
            color: '#111827',
            borderColor: '#d1d5db',
        },
        hover: '#e5e7eb',
        disabled: '#f9fafb',
    },
    danger: {
        base: {
            backgroundColor: '#ef4444',
            color: 'white',
        },
        hover: '#dc2626',
        disabled: '#fca5a5',
    },
    success: {
        base: {
            backgroundColor: '#22c55e',
            color: 'white',
        },
        hover: '#16a34a',
        disabled: '#86efac',
    },
    ghost: {
        base: {
            backgroundColor: 'transparent',
            color: '#374151',
        },
        hover: '#f3f4f6',
        disabled: 'transparent',
    },
};

const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
};

export const Button: React.FC<ButtonProps> = ({
    variant = 'primary',
    size = 'md',
    isLoading = false,
    icon,
    children,
    disabled,
    className = '',
    style,
    ...props
}) => {
    const variantStyle = variantStyles[variant];
    const isDisabled = disabled || isLoading;

    const buttonStyle = {
        ...variantStyle.base,
        ...(isDisabled && variant !== 'ghost' ? { backgroundColor: variantStyle.disabled } : {}),
        ...style,
    };

    return (
        <button
            disabled={isDisabled}
            style={buttonStyle}
            className={`
                inline-flex items-center justify-center gap-2
                font-medium rounded-lg
                transition-all duration-200
                cursor-pointer
                disabled:cursor-not-allowed disabled:opacity-60
                focus:outline-none focus:ring-2 focus:ring-offset-2
                ${variant === 'secondary' ? 'border shadow-sm' : 'shadow-sm hover:shadow-md'}
                ${sizeClasses[size]}
                ${className}
            `}
            onMouseEnter={(e) => {
                if (!isDisabled && variantStyle.hover) {
                    e.currentTarget.style.backgroundColor = variantStyle.hover;
                }
            }}
            onMouseLeave={(e) => {
                if (!isDisabled) {
                    e.currentTarget.style.backgroundColor = variantStyle.base.backgroundColor;
                }
            }}
            {...props}
        >
            {isLoading && <Spinner size="sm" className="border-current" />}
            {!isLoading && icon && <span className="flex-shrink-0">{icon}</span>}
            <span>{children}</span>
        </button>
    );
};
