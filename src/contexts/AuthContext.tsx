import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface AuthContextType {
    token: string | null;
    userId: string | null;
    isLoggedIn: boolean;
    login: (token: string, userId: string, username: string) => void;
    logout: () => void;
    isLoading: boolean;
    username: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [token, setToken] = useState<string | null>(localStorage.getItem('authToken'));
    const [userId, setUserId] = useState<string | null>(localStorage.getItem('userId'));
    const [username, setUsername] = useState<string | null>(localStorage.getItem('username'));
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const storedToken = localStorage.getItem('authToken');
        const storedUserId = localStorage.getItem('userId');
        const storedUsername = localStorage.getItem('username');
        if (storedToken && storedUserId) {
            setToken(storedToken);
            setUserId(storedUserId);
            setUsername(storedUsername);
        }
        setIsLoading(false);
    }, []);

    const login = (newToken: string, newUserId: string, username: string) => {
        localStorage.setItem('authToken', newToken);
        localStorage.setItem('userId', newUserId);
        localStorage.setItem('username', username);
        setToken(newToken);
        setUserId(newUserId);
        setUsername(username);
    };

    const logout = () => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('userId');
        localStorage.removeItem('username');
        setToken(null);
        setUserId(null);
        setUsername(null);
    };

    return (
        <AuthContext.Provider value={{ token, userId, isLoggedIn: !!token, login, logout, isLoading, username }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
