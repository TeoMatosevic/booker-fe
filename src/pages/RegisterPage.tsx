import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthForm from '../components/AuthForm';
import apiClient from '../api';
import { useToast } from '../contexts/ToastContext';

const RegisterPage: React.FC = () => {
    const navigate = useNavigate();
    const { showToast } = useToast();
    const [isLoading, setIsLoading] = useState(false);

    const handleRegister = async (formData: any) => {
        setIsLoading(true);
        try {
            await apiClient.post('/users/register', formData);
            showToast('success', 'Registration successful! Please login.');
            setTimeout(() => navigate('/login'), 1000);
        } catch (error) {
            console.error('Registration failed:', error);
            setIsLoading(false);
            throw error;
        }
    };

    return <AuthForm formType="register" onSubmit={handleRegister} isLoading={isLoading} />;
};

export default RegisterPage;
