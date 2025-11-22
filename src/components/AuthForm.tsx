import React, { useState } from 'react';
import { Calendar, Eye, EyeOff } from 'lucide-react';
import { Button, Input, Alert } from './ui';

interface AuthFormProps {
    formType: 'login' | 'register';
    onSubmit: (formData: any) => Promise<void>;
    isLoading: boolean;
}

const AuthForm: React.FC<AuthFormProps> = ({ formType, onSubmit, isLoading }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (formType === 'register' && password !== confirmPassword) {
            setError("Passwords don't match");
            return;
        }

        if (formType === 'register' && password.length < 6) {
            setError("Password must be at least 6 characters long");
            return;
        }

        try {
            await onSubmit({ username, password });
        } catch (err: any) {
            console.error('Submission error:', err);
            setError(err.response?.data?.error || err.message || 'An error occurred');
        }
    };

    const title = formType === 'login' ? 'Sign In' : 'Create Account';
    const subtitle = formType === 'login'
        ? 'Welcome back! Please enter your details.'
        : 'Get started by creating your account.';

    return (
        <div
            className="min-h-screen flex items-center justify-center p-4"
            style={{ background: 'linear-gradient(to bottom right, #eef2ff, #ffffff, #e0e7ff)' }}
        >
            <div className="bg-white p-8 rounded-2xl shadow-strong w-full max-w-md animate-scale-in">
                {/* Logo and Header */}
                <div className="text-center mb-8">
                    <div
                        className="inline-flex items-center justify-center w-16 h-16 rounded-2xl shadow-md mb-4"
                        style={{ background: 'linear-gradient(to bottom right, #4f46e5, #4338ca)' }}
                    >
                        <Calendar className="text-white" size={32} />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Booker</h1>
                    <h2 className="text-xl font-semibold text-gray-900 mb-1">{title}</h2>
                    <p className="text-gray-600 text-sm">{subtitle}</p>
                </div>

                {/* Error Alert */}
                {error && (
                    <div className="mb-6 animate-slide-down">
                        <Alert
                            variant="error"
                            message={error}
                            onDismiss={() => setError(null)}
                        />
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input
                        label="Username"
                        type="text"
                        id="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Enter your username"
                        required
                        autoComplete="username"
                    />

                    <div>
                        <div className="relative">
                            <Input
                                label="Password"
                                type={showPassword ? 'text' : 'password'}
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter your password"
                                required
                                autoComplete={formType === 'login' ? 'current-password' : 'new-password'}
                                helperText={formType === 'register' ? 'Must be at least 6 characters long' : undefined}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-[38px] text-gray-500 hover:text-gray-700 transition-colors cursor-pointer"
                                tabIndex={-1}
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    {formType === 'register' && (
                        <div>
                            <div className="relative">
                                <Input
                                    label="Confirm Password"
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    id="confirmPassword"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="Confirm your password"
                                    required
                                    autoComplete="new-password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-3 top-[38px] text-gray-500 hover:text-gray-700 transition-colors cursor-pointer"
                                    tabIndex={-1}
                                >
                                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>
                    )}

                    <div className="pt-2">
                        <Button
                            type="submit"
                            isLoading={isLoading}
                            className="w-full"
                            size="lg"
                        >
                            {title}
                        </Button>
                    </div>
                </form>

                {/* Navigation Link */}
                <div className="mt-6 text-center">
                    <p className="text-sm text-gray-600">
                        {formType === 'login' ? (
                            <>
                                Don't have an account?{' '}
                                <a
                                    href="/register"
                                    style={{ color: '#4f46e5' }}
                                    className="font-medium transition-colors cursor-pointer"
                                    onMouseEnter={(e) => { e.currentTarget.style.color = '#4338ca'; }}
                                    onMouseLeave={(e) => { e.currentTarget.style.color = '#4f46e5'; }}
                                >
                                    Create account
                                </a>
                            </>
                        ) : (
                            <>
                                Already have an account?{' '}
                                <a
                                    href="/login"
                                    style={{ color: '#4f46e5' }}
                                    className="font-medium transition-colors cursor-pointer"
                                    onMouseEnter={(e) => { e.currentTarget.style.color = '#4338ca'; }}
                                    onMouseLeave={(e) => { e.currentTarget.style.color = '#4f46e5'; }}
                                >
                                    Sign in
                                </a>
                            </>
                        )}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AuthForm;
