import React, { useContext } from 'react';
import { render, screen, act, waitFor } from '@testing-library/react';
import axios from 'axios';
import { UserContext, UserProvider } from '../context/UserContext';

jest.mock('axios');

let ctx;
const Probe = () => {
    ctx = useContext(UserContext);
    return <div data-testid="counts">{`${ctx.state.income.length}/${ctx.state.expenses.length}/${ctx.state.savingsGoals.length}`}</div>;
};

const renderProvider = () => render(<UserProvider><Probe /></UserProvider>);

beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
});

test('adds and deletes entries through the mounted /api/budget routes', async () => {
    axios.post.mockResolvedValueOnce({ data: { _id: 'i1', amount: 10 } })
        .mockResolvedValueOnce({ data: { _id: 'e1', amount: 5 } })
        .mockResolvedValueOnce({ data: { _id: 'g1', goalName: 'Trip' } });
    renderProvider();

    await act(async () => { await ctx.addIncome({ amount: 10 }); });
    await act(async () => { await ctx.addExpense({ amount: 5 }); });
    await act(async () => { await ctx.addSavingGoal({ goalName: 'Trip' }); });

    expect(screen.getByTestId('counts')).toHaveTextContent('1/1/1');
    expect(axios.post.mock.calls.map((c) => c[0].replace(/^https?:\/\/[^/]+/, ''))).toEqual([
        '/api/budget/income', '/api/budget/expense', '/api/budget/saving',
    ]);

    await act(async () => { await ctx.deleteIncome('i1'); });
    await act(async () => { await ctx.deleteExpense('e1'); });
    await act(async () => { await ctx.deleteSavingGoal('g1'); });

    expect(screen.getByTestId('counts')).toHaveTextContent('0/0/0');
    expect(axios.delete).toHaveBeenCalledTimes(3);
});

test('SET_USER persists the token and LOGOUT clears it', async () => {
    renderProvider();
    act(() => ctx.dispatch({ type: 'SET_USER', payload: { token: 'abc', user: { income: [{ _id: 1 }] } } }));
    expect(localStorage.getItem('token')).toBe('abc');
    expect(screen.getByTestId('counts')).toHaveTextContent('1/0/0');
    await waitFor(() => expect(axios.defaults.headers.common.Authorization).toBe('Bearer abc'));

    act(() => ctx.dispatch({ type: 'LOGOUT' }));
    expect(localStorage.getItem('token')).toBeNull();
    expect(screen.getByTestId('counts')).toHaveTextContent('0/0/0');
    await waitFor(() => expect(axios.defaults.headers.common.Authorization).toBeUndefined());
});

test('rehydrates the user from /auth/me when a token is stored', async () => {
    localStorage.setItem('token', 'stored');
    axios.get.mockResolvedValueOnce({ data: { id: 'u1', username: 'ada', income: [{ _id: 'x' }], expenses: [], savingsGoals: [] } });
    renderProvider();

    await waitFor(() => expect(screen.getByTestId('counts')).toHaveTextContent('1/0/0'));
    expect(axios.get.mock.calls[0][0]).toMatch(/\/auth\/me$/);
});

test('an invalid stored token is discarded', async () => {
    localStorage.setItem('token', 'expired');
    axios.get.mockRejectedValueOnce(new Error('401'));
    renderProvider();

    await waitFor(() => expect(localStorage.getItem('token')).toBeNull());
});
