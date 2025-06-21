import React, { useState } from 'react';
import AuthForm from '../components/AuthForm';
import apiClient from '../api';
import { useAuth } from '../contexts/AuthContext';

const LoginPage: React.FC = () => {
    const { login } = useAuth();
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async (formData: any) => {
        setIsLoading(true);
        try {
            const response = await apiClient.post('/users/login', formData);
            login(response.data.token, response.data.userID.toString(), response.data.username);
        } catch (error) {
            console.error('Login failed:', error);
            setIsLoading(false);
            throw error;
        }
        setIsLoading(false);
    };

    return <AuthForm formType="login" onSubmit={handleLogin} isLoading={isLoading} />;
};

export default LoginPage;
