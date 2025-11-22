import React from 'react';
import { ChevronDown } from 'lucide-react';

export interface SelectOption {
    value: string;
    label: string;
}

export interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
    label?: string;
    options: SelectOption[];
    error?: string;
    helperText?: string;
    icon?: React.ReactNode;
}

export const Select: React.FC<SelectProps> = ({
    label,
    options,
    error,
    helperText,
    icon,
    className = '',
    disabled,
    required,
    style,
    ...props
}) => {
    const hasError = !!error;

    const selectStyle = {
        borderColor: hasError ? '#ef4444' : '#d1d5db',
        ...style,
    };

    return (
        <div className="w-full">
            {label && (
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    {label}
                    {required && <span style={{ color: '#ef4444' }} className="ml-1">*</span>}
                </label>
            )}
            <div className="relative">
                {icon && (
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none">
                        {icon}
                    </div>
                )}
                <select
                    style={selectStyle}
                    className={`
                        w-full px-3 py-2 pr-10 bg-white border rounded-lg
                        text-sm text-gray-900
                        transition-all duration-200
                        appearance-none cursor-pointer
                        focus:outline-none focus:ring-2 focus:border-transparent
                        disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed
                        ${icon ? 'pl-10' : ''}
                        ${className}
                    `}
                    disabled={disabled}
                    required={required}
                    onFocus={(e) => {
                        if (hasError) {
                            e.currentTarget.style.boxShadow = '0 0 0 3px rgba(239, 68, 68, 0.1)';
                        } else {
                            e.currentTarget.style.boxShadow = '0 0 0 3px rgba(79, 70, 229, 0.1)';
                        }
                    }}
                    onBlur={(e) => {
                        e.currentTarget.style.boxShadow = '';
                    }}
                    onMouseEnter={(e) => {
                        if (!hasError && !disabled) {
                            e.currentTarget.style.borderColor = '#9ca3af';
                        }
                    }}
                    onMouseLeave={(e) => {
                        if (!hasError) {
                            e.currentTarget.style.borderColor = '#d1d5db';
                        }
                    }}
                    {...props}
                >
                    {options.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
                <ChevronDown
                    size={18}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"
                />
            </div>
            {error && (
                <p className="mt-1 text-xs" style={{ color: '#dc2626' }}>{error}</p>
            )}
            {!error && helperText && (
                <p className="mt-1 text-xs text-gray-500">{helperText}</p>
            )}
        </div>
    );
};
