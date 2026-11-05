import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Login from '../Components/Login';
import { UserContext } from '../context/UserContext';
import { AuthContext } from '../context/AuthContext';

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: () => mockNavigate,
}));

const setup = () => {
    const dispatch = jest.fn();
    const login = jest.fn();
    render(
        <MemoryRouter>
            <UserContext.Provider value={{ dispatch }}>
                <AuthContext.Provider value={{ login }}>
                    <Login />
                </AuthContext.Provider>
            </UserContext.Provider>
        </MemoryRouter>
    );
    fireEvent.change(screen.getByPlaceholderText('Username'), { target: { value: 'ada' } });
    fireEvent.change(screen.getByPlaceholderText('Password'), { target: { value: 'Str0ng!Pass' } });
    fireEvent.submit(screen.getByTestId('login-form'));
    return { dispatch, login };
};

beforeEach(() => {
    mockNavigate.mockReset();
});

test('successful login stores the user and goes to the dashboard', async () => {
    global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ token: 'jwt', user: { username: 'ada', income: [] } }),
    });
    const { dispatch, login } = setup();

    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/dashboard/home'));
    expect(dispatch).toHaveBeenCalledWith({ type: 'SET_USER', payload: { user: { username: 'ada', income: [] }, token: 'jwt' } });
    expect(login).toHaveBeenCalledWith({ username: 'ada', token: 'jwt' });
    expect(JSON.parse(global.fetch.mock.calls[0][1].body)).toEqual({ username: 'ada', password: 'Str0ng!Pass' });
});

test('shows the server error message when credentials are rejected', async () => {
    global.fetch = jest.fn().mockResolvedValue({ ok: false, json: async () => ({ message: 'Invalid credentials.' }) });
    setup();

    expect(await screen.findByText('Invalid credentials.')).toBeInTheDocument();
    expect(mockNavigate).not.toHaveBeenCalled();
});

test('shows a friendly message when the server is unreachable', async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error('network down'));
    setup();

    expect(await screen.findByText(/unable to connect/i)).toBeInTheDocument();
});
