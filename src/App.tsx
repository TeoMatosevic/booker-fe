import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import HomePage from './pages/HomePage';
import ProtectedRoute from './components/ProtectedRoute';

function AppContent() {
    const { isLoggedIn, isLoading } = useAuth();

    if (isLoading) {
        return <div className="min-h-screen flex items-center justify-center">Initializing App...</div>;
    }

    return (
        <>
            <Navbar />
            <main className="pt-16">
                <Routes>
                    <Route
                        path="/login"
                        element={isLoggedIn ? <Navigate to="/" replace /> : <LoginPage />}
                    />
                    <Route
                        path="/register"
                        element={isLoggedIn ? <Navigate to="/" replace /> : <RegisterPage />}
                    />

                    <Route element={<ProtectedRoute />}>
                        <Route path="/" element={<HomePage />} />
                    </Route>

                    <Route
                        path="*"
                        element={isLoggedIn ? <Navigate to="/" replace /> : <Navigate to="/login" replace />}
                    />
                </Routes>
            </main>
        </>
    );
}

function App() {
    return (
        <Router>
            <AuthProvider>
                <AppContent />
            </AuthProvider>
        </Router>
    );
}

export default App;
