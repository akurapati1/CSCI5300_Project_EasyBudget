import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import * as C from './Components';

const API = process.env.REACT_APP_API_URL || 'http://localhost:5001';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const res = await fetch(`${API}/auth/forgot-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });
            const data = await res.json();
            if (!res.ok) {
                setError(data.message || 'Something went wrong.');
                return;
            }
            setSent(true);
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
                    {sent ? (
                        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'center' }}>
                            <div style={{ fontSize: 40 }}>📬</div>
                            <C.Title style={{ fontSize: 22 }}>Check your inbox</C.Title>
                            <C.Subtitle>
                                If that email is registered, we've sent a reset link. Check your spam folder if you don't see it.
                            </C.Subtitle>
                            <C.Anchor as={Link} to="/">Back to sign in</C.Anchor>
                        </div>
                    ) : (
                        <C.Form onSubmit={handleSubmit}>
                            <C.Title>Forgot password?</C.Title>
                            <C.Subtitle>Enter your email and we'll send you a reset link.</C.Subtitle>
                            {error && <C.ErrorMsg>{error}</C.ErrorMsg>}
                            <C.Input
                                type="email"
                                placeholder="Your email address"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                autoFocus
                            />
                            <C.Button type="submit" disabled={!email || loading}>
                                {loading ? 'Sending...' : 'Send Reset Link'}
                            </C.Button>
                            <C.Anchor as={Link} to="/">Back to sign in</C.Anchor>
                        </C.Form>
                    )}
                </C.SignInContainer>
            </C.Container>
        </C.Parent>
    );
};

export default ForgotPassword;
