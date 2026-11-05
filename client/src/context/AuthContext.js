import React, { createContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [initializing, setInitializing] = useState(true);

    useEffect(() => {
        try {
            const token = localStorage.getItem('token');
            const userData = localStorage.getItem('user');
            if (token && userData) {
                const decoded = jwtDecode(token);
                if (decoded.exp && decoded.exp * 1000 < Date.now()) {
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                } else {
                    const parsed = JSON.parse(userData);
                    setUser({ ...parsed, id: decoded.id });
                }
            }
        } catch {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
        } finally {
            setInitializing(false);
        }
    }, []);

    const login = (userData) => {
        const decoded = jwtDecode(userData.token);
        const userWithId = { ...userData, id: decoded.id };
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('token', userData.token);
        setUser(userWithId);
    };

    const logout = (dispatch) => {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        setUser(null);
        if (dispatch) dispatch({ type: 'LOGOUT' });
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, initializing }}>
            {children}
        </AuthContext.Provider>
    );
};

export { AuthContext, AuthProvider };
export default AuthContext;
