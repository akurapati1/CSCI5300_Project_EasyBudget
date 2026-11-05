import styled from 'styled-components';

export const Parent = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  width: 100%;
  background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%);
  padding: 20px;
`;

export const Container = styled.div`
  background: rgba(30, 41, 59, 0.9);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(99, 102, 241, 0.2);
  border-radius: 20px;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255,255,255,0.05);
  width: 460px;
  max-width: 100%;
  padding: 48px 40px;
  display: flex;
  justify-content: center;
  align-items: center;
`;

export const SignInContainer = styled.div`
  width: 100%;
`;

export const SignUpContainer = styled.div`
  width: 100%;
`;

export const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 14px;
  width: 100%;
`;

export const Title = styled.h1`
  font-size: 28px;
  font-weight: 700;
  color: #f1f5f9;
  margin-bottom: 8px;
  text-align: center;
  letter-spacing: -0.5px;
`;

export const Subtitle = styled.p`
  font-size: 14px;
  color: #94a3b8;
  text-align: center;
  margin-bottom: 8px;
`;

export const Input = styled.input`
  background: rgba(15, 23, 42, 0.8);
  border: 1px solid rgba(99, 102, 241, 0.3);
  border-radius: 10px;
  padding: 13px 16px;
  font-size: 15px;
  color: #f1f5f9;
  width: 100%;
  transition: border-color 0.2s, box-shadow 0.2s;
  outline: none;

  &::placeholder {
    color: #64748b;
  }

  &:focus {
    border-color: #6366f1;
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.15);
  }
`;

export const Button = styled.button`
  background: linear-gradient(135deg, #6366f1, #4f46e5);
  color: #ffffff;
  border: none;
  border-radius: 10px;
  padding: 13px 24px;
  font-size: 15px;
  font-weight: 600;
  letter-spacing: 0.3px;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-top: 6px;
  width: 100%;

  &:hover:not(:disabled) {
    background: linear-gradient(135deg, #4f46e5, #4338ca);
    transform: translateY(-1px);
    box-shadow: 0 8px 20px rgba(99, 102, 241, 0.4);
  }

  &:active {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export const Anchor = styled.a`
  color: #94a3b8;
  font-size: 13px;
  text-decoration: none;
  text-align: center;
  transition: color 0.2s;

  &:hover {
    color: #a5b4fc;
  }
`;

export const ErrorMsg = styled.p`
  color: #f87171;
  font-size: 13px;
  text-align: center;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.2);
  border-radius: 8px;
  padding: 10px;
`;
