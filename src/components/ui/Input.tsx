import React from 'react';
import { AlertCircle, CheckCircle } from 'lucide-react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    helperText?: string;
    isValid?: boolean;
    showValidation?: boolean;
}

export const Input: React.FC<InputProps> = ({
    label,
    error,
    helperText,
    isValid = false,
    showValidation = false,
    className = '',
    required,
    style,
    ...props
}) => {
    const hasError = Boolean(error);
    const showSuccess = showValidation && isValid && !hasError;

    const inputStyle = {
        borderColor: hasError ? '#ef4444' : showSuccess ? '#22c55e' : '#d1d5db',
        ...style,
    };

    return (
        <div className="w-full">
            {label && (
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    {label}
                    {required && <span style={{ color: '#ef4444' }} className="ml-1">*</span>}
                </label>
            )}
            <div className="relative">
                <input
                    style={inputStyle}
                    className={`
                        w-full px-3 py-2 pr-10
                        text-gray-900 placeholder-gray-400
                        bg-white border rounded-lg
                        transition-all duration-200
                        focus:outline-none focus:ring-2 focus:border-transparent
                        disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed
                        ${className}
                    `}
                    onFocus={(e) => {
                        if (hasError) {
                            e.currentTarget.style.boxShadow = '0 0 0 3px rgba(239, 68, 68, 0.1)';
                        } else if (showSuccess) {
                            e.currentTarget.style.boxShadow = '0 0 0 3px rgba(34, 197, 94, 0.1)';
                        } else {
                            e.currentTarget.style.boxShadow = '0 0 0 3px rgba(79, 70, 229, 0.1)';
                        }
                    }}
                    onBlur={(e) => {
                        e.currentTarget.style.boxShadow = '';
                    }}
                    {...props}
                />
                {showValidation && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        {hasError && <AlertCircle style={{ color: '#ef4444' }} size={18} />}
                        {showSuccess && <CheckCircle style={{ color: '#22c55e' }} size={18} />}
                    </div>
                )}
            </div>
            {error && (
                <p className="mt-1.5 text-xs flex items-center gap-1" style={{ color: '#dc2626' }}>
                    <AlertCircle size={12} />
                    {error}
                </p>
            )}
            {helperText && !error && (
                <p className="mt-1.5 text-xs text-gray-500">{helperText}</p>
            )}
        </div>
    );
};
