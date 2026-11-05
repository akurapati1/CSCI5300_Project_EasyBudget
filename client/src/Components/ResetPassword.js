import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import * as C from './Components';
import styled from 'styled-components';

const API = process.env.REACT_APP_API_URL || 'http://localhost:5001';

const criteria = [
    { label: 'At least 8 characters', test: (p) => p.length >= 8 },
    { label: 'Uppercase letter (A–Z)', test: (p) => /[A-Z]/.test(p) },
    { label: 'Lowercase letter (a–z)', test: (p) => /[a-z]/.test(p) },
    { label: 'Number (0–9)', test: (p) => /\d/.test(p) },
    { label: 'Special character (!@#$…)', test: (p) => /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(p) },
];

const CriteriaList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 6px 0 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const CriteriaItem = styled.li`
  font-size: 12px;
  color: ${({ met }) => (met ? '#34d399' : '#64748b')};
  display: flex;
  align-items: center;
  gap: 6px;
  transition: color 0.2s;
  &::before { content: '${({ met }) => (met ? '✓' : '○')}'; font-size: 11px; font-weight: 700; }
`;

const ResetPassword = () => {
    const { token } = useParams();
    const navigate = useNavigate();
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const allMet = criteria.every(c => c.test(password));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (!allMet) { setError('Please meet all password requirements.'); return; }
        setLoading(true);
        try {
            const res = await fetch(`${API}/auth/reset-password/${token}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password })
            });
            const data = await res.json();
            if (!res.ok) { setError(data.message || 'Reset failed.'); return; }
            setSuccess(true);
            setTimeout(() => navigate('/'), 2500);
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
                    {success ? (
                        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'center' }}>
                            <div style={{ fontSize: 40 }}>✅</div>
                            <C.Title style={{ fontSize: 22 }}>Password reset!</C.Title>
                            <C.Subtitle>Redirecting you to sign in…</C.Subtitle>
                        </div>
                    ) : (
                        <C.Form onSubmit={handleSubmit}>
                            <C.Title>Set new password</C.Title>
                            <C.Subtitle>Choose a strong password for your account.</C.Subtitle>
                            {error && <C.ErrorMsg>{error}</C.ErrorMsg>}
                            <div>
                                <C.Input
                                    type="password"
                                    placeholder="New password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    autoFocus
                                    style={{ marginBottom: 0 }}
                                />
                                {password.length > 0 && (
                                    <CriteriaList>
                                        {criteria.map(c => (
                                            <CriteriaItem key={c.label} met={c.test(password) ? 1 : 0}>
                                                {c.label}
                                            </CriteriaItem>
                                        ))}
                                    </CriteriaList>
                                )}
                            </div>
                            <C.Button type="submit" disabled={!password || !allMet || loading}>
                                {loading ? 'Resetting...' : 'Reset Password'}
                            </C.Button>
                            <C.Anchor as={Link} to="/">Back to sign in</C.Anchor>
                        </C.Form>
                    )}
                </C.SignInContainer>
            </C.Container>
        </C.Parent>
    );
};

export default ResetPassword;
