import { createContext, useContext, useState, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance';

const AuthContext = createContext(null);

function decodeJwt(token) {
    try {
        const payload = token.split('.')[1];
        return JSON.parse(atob(payload));
    } catch {
        return null;
    }
}

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(() => localStorage.getItem('token'));
    const [role, setRole] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedToken = localStorage.getItem('token');
        if (storedToken) {
            const decoded = decodeJwt(storedToken);
            if (decoded && decoded.exp * 1000 > Date.now()) {
                const rawRole = decoded.role || decoded.roles?.[0] || '';
                const role = rawRole.replace(/^ROLE_/, '');
                setToken(storedToken);
                setUser({ phone: decoded.sub, id: decoded.userId, ...decoded });
                setRole(role);
            } else {
                localStorage.clear();
            }
        }
        setLoading(false);
    }, []);

    const login = async (phone, password) => {
        const response = await axiosInstance.post('/auth/login', { phone, password });
        // Backend returns: { status, message, data: "<jwt-string>" }
        const payload = response.data?.data;
        const jwtToken = typeof payload === 'string' ? payload : payload?.token;
        localStorage.setItem('token', jwtToken);
        const decoded = decodeJwt(jwtToken);
        // Role in JWT is "ROLE_ADMIN" — strip prefix for frontend routing
        const rawRole = decoded.role || decoded.roles?.[0] || '';
        const role = rawRole.replace(/^ROLE_/, '');
        setToken(jwtToken);
        setUser({ phone: decoded.sub, id: decoded.userId, ...decoded });
        setRole(role);
        return { ...decoded, role };
    };

    const logout = () => {
        localStorage.clear();
        setToken(null);
        setUser(null);
        setRole(null);
        window.location.href = '/login';
    };

    return (
        <AuthContext.Provider value={{ user, token, role, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
}
