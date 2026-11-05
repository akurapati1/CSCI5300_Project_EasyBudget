import React, { useState, useContext } from 'react';
import { UserContext } from '../context/UserContext';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import * as C from './Components';

const API = process.env.REACT_APP_API_URL || 'http://localhost:5001';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { dispatch } = useContext(UserContext);
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const res = await fetch(`${API}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });
            const data = await res.json();
            if (!res.ok) {
                setError(data.message || 'Login failed. Please check your credentials.');
                return;
            }
            dispatch({ type: 'SET_USER', payload: { user: data.user, token: data.token } });
            login({ username, token: data.token });
            navigate('/dashboard/home');
        } catch {
            setError('Unable to connect to server. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <C.Parent>
            <C.Container>
                <C.SignInContainer>
                    <C.Form onSubmit={handleSubmit} data-testid="login-form">
                        <C.Title>Welcome back</C.Title>
                        <C.Subtitle>Sign in to your account</C.Subtitle>
                        {error && <C.ErrorMsg>{error}</C.ErrorMsg>}
                        <C.Input
                            type="text"
                            placeholder="Username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                            autoFocus
                        />
                        <C.Input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                        <C.Button type="submit" disabled={!username || !password || loading}>
                            {loading ? 'Signing in...' : 'Sign In'}
                        </C.Button>
                        <C.Anchor as={Link} to="/forgot-password">
                            Forgot your password?
                        </C.Anchor>
                        <C.Anchor as={Link} to="/register">
                            Don't have an account? Sign up
                        </C.Anchor>
                    </C.Form>
                </C.SignInContainer>
            </C.Container>
        </C.Parent>
    );
};

export default Login;
