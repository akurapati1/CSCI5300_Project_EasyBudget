import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
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

const StrengthBar = styled.div`
  display: flex;
  gap: 4px;
  margin-top: 6px;
`;

const StrengthSegment = styled.div`
  flex: 1;
  height: 3px;
  border-radius: 2px;
  background: ${({ active, level }) => {
    if (!active) return 'rgba(255,255,255,0.08)';
    if (level <= 1) return '#ef4444';
    if (level <= 2) return '#f97316';
    if (level <= 3) return '#f59e0b';
    if (level <= 4) return '#84cc16';
    return '#10b981';
  }};
  transition: background 0.2s;
`;

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

  &::before {
    content: '${({ met }) => (met ? '✓' : '○')}';
    font-size: 11px;
    font-weight: 700;
  }
`;

const Register = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showCriteria, setShowCriteria] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const metCount = criteria.filter(c => c.test(password)).length;
    const allMet = metCount === criteria.length;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const res = await fetch(`${API}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, email, password })
            });
            if (!res.ok) {
                alert('Registration failed');
                return;
            }
            navigate('/login');
        } catch {
            setError('Unable to connect to server. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <C.Parent>
            <C.Container style={{ maxWidth: 480 }}>
                <C.SignUpContainer>
                    <C.Form onSubmit={handleSubmit} data-testid="register-form">
                        <C.Title>Create account</C.Title>
                        <C.Subtitle>Start managing your finances today</C.Subtitle>
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
                            type="email"
                            placeholder="Email (required for password recovery)"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                        <div>
                            <C.Input
                                type="password"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                onFocus={() => setShowCriteria(true)}
                                required
                                style={{ marginBottom: 0 }}
                            />
                            {password.length > 0 && (
                                <>
                                    <StrengthBar>
                                        {[1, 2, 3, 4, 5].map(i => (
                                            <StrengthSegment key={i} active={metCount >= i} level={metCount} />
                                        ))}
                                    </StrengthBar>
                                </>
                            )}
                            {showCriteria && (
                                <CriteriaList>
                                    {criteria.map(c => (
                                        <CriteriaItem key={c.label} met={c.test(password) ? 1 : 0}>
                                            {c.label}
                                        </CriteriaItem>
                                    ))}
                                </CriteriaList>
                            )}
                        </div>
                        <C.Button type="submit" disabled={!username || !password || loading}>
                            {loading ? 'Creating account...' : 'Sign Up'}
                        </C.Button>
                        <C.Anchor as={Link} to="/">
                            Already have an account? Sign in
                        </C.Anchor>
                    </C.Form>
                </C.SignUpContainer>
            </C.Container>
        </C.Parent>
    );
};

export default Register;
