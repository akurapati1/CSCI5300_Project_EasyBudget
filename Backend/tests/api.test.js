process.env.JWT_SECRET = 'test-secret';
process.env.CLIENT_ORIGIN = 'http://localhost:3000';

jest.mock('../models/User', () => require('./helpers/fakeUserModel'));
jest.mock('../utils/mailer', () => ({ sendPasswordResetEmail: jest.fn().mockResolvedValue() }));

const crypto = require('crypto');
const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../app');
const User = require('../models/User');
const { sendPasswordResetEmail } = require('../utils/mailer');

const STRONG = 'Str0ng!Pass';
const register = (overrides = {}) =>
    request(app).post('/auth/register').send({ username: 'ada', email: 'Ada@Example.com', password: STRONG, ...overrides });

const login = async (username = 'ada', password = STRONG) => (await request(app).post('/auth/login').send({ username, password }));

beforeEach(() => {
    User.reset();
    jest.clearAllMocks();
});

describe('auth', () => {
    test('registers, then logs in and returns a verifiable JWT', async () => {
        expect((await register()).status).toBe(201);
        const res = await login();
        expect(res.status).toBe(200);
        expect(jwt.verify(res.body.token, 'test-secret').id).toBeDefined();
        expect(res.body.user).toEqual(expect.objectContaining({ username: 'ada', income: [], expenses: [], savingsGoals: [] }));
        expect(res.body.user.password).toBeUndefined();
    });

    test('stores a bcrypt hash and a normalised e-mail', async () => {
        await register();
        const [user] = User.all();
        expect(user.password).not.toBe(STRONG);
        expect(user.password).toMatch(/^\$2[aby]\$/);
        expect(user.email).toBe('ada@example.com');
    });

    test('rejects weak passwords, missing e-mail and duplicate usernames', async () => {
        expect((await register({ password: 'weakpass' })).status).toBe(400);
        expect((await register({ email: undefined })).status).toBe(400);
        await register();
        expect((await register()).status).toBe(409);
    });

    test('rejects wrong credentials and NoSQL-injection payloads', async () => {
        await register();
        expect((await login('ada', 'Wrong!Pass1')).status).toBe(401);
        const injected = await request(app).post('/auth/login').send({ username: { $ne: null }, password: { $ne: null } });
        expect(injected.status).toBe(400);
    });

    test('GET /auth/me needs a valid token (401 otherwise)', async () => {
        expect((await request(app).get('/auth/me')).status).toBe(401);
        expect((await request(app).get('/auth/me').set('Authorization', 'Bearer nope')).status).toBe(401);
        await register();
        const { body } = await login();
        const me = await request(app).get('/auth/me').set('Authorization', `Bearer ${body.token}`);
        expect(me.status).toBe(200);
        expect(me.body.username).toBe('ada');
    });
});

describe('password reset', () => {
    test('does not reveal whether an e-mail exists', async () => {
        const unknown = await request(app).post('/auth/forgot-password').send({ email: 'nobody@example.com' });
        await register();
        const known = await request(app).post('/auth/forgot-password').send({ email: 'ada@example.com' });
        expect(unknown.status).toBe(200);
        expect(known.body).toEqual(unknown.body);
        expect(sendPasswordResetEmail).toHaveBeenCalledTimes(1);
    });

    test('stores only a hash of the reset token and lets it be used exactly once', async () => {
        await register();
        await request(app).post('/auth/forgot-password').send({ email: 'ada@example.com' });
        const url = sendPasswordResetEmail.mock.calls[0][1];
        const token = url.split('/reset-password/')[1];
        const [user] = User.all();
        expect(user.resetPasswordToken).not.toBe(token);
        expect(user.resetPasswordToken).toBe(crypto.createHash('sha256').update(token).digest('hex'));

        const ok = await request(app).post(`/auth/reset-password/${token}`).send({ password: 'N3w!Password' });
        expect(ok.status).toBe(200);
        expect((await login('ada', 'N3w!Password')).status).toBe(200);
        expect((await request(app).post(`/auth/reset-password/${token}`).send({ password: 'An0ther!Pass' })).status).toBe(400);
    });

    test('rejects expired tokens', async () => {
        await register();
        await request(app).post('/auth/forgot-password').send({ email: 'ada@example.com' });
        const token = sendPasswordResetEmail.mock.calls[0][1].split('/reset-password/')[1];
        User.all()[0].resetPasswordExpires = Date.now() - 1000;
        expect((await request(app).post(`/auth/reset-password/${token}`).send({ password: 'N3w!Password' })).status).toBe(400);
    });
});

describe('budget', () => {
    let auth;
    beforeEach(async () => {
        await register();
        auth = `Bearer ${(await login()).body.token}`;
    });

    const income = { date: '2025-01-15', amount: 2500, description: 'Salary', frequency: 'monthly' };

    test('requires authentication', async () => {
        expect((await request(app).post('/api/budget/income').send(income)).status).toBe(401);
    });

    test('adds and deletes income, expenses and savings goals', async () => {
        const added = await request(app).post('/api/budget/income').set('Authorization', auth).send(income);
        expect(added.status).toBe(201);
        expect(added.body._id).toBeDefined();

        const expense = await request(app).post('/api/budget/expense').set('Authorization', auth)
            .send({ ...income, amount: 40, description: 'Gym', frequency: 'weekly' });
        expect(expense.status).toBe(201);

        const goal = await request(app).post('/api/budget/saving').set('Authorization', auth)
            .send({ goalName: 'Laptop', goalAmount: 1500, allocatedPercentage: 20 });
        expect(goal.status).toBe(201);

        const me = await request(app).get('/auth/me').set('Authorization', auth);
        expect([me.body.income.length, me.body.expenses.length, me.body.savingsGoals.length]).toEqual([1, 1, 1]);

        expect((await request(app).delete(`/api/budget/income/${added.body._id}`).set('Authorization', auth)).status).toBe(200);
        const after = await request(app).get('/auth/me').set('Authorization', auth);
        expect(after.body.income).toHaveLength(0);
    });

    test.each([
        ['negative amount', { amount: -5 }],
        ['non-numeric amount', { amount: 'abc' }],
        ['bad date', { date: 'not-a-date' }],
        ['bad frequency', { frequency: 'daily' }],
        ['missing description', { description: '' }]
    ])('rejects invalid income: %s', async (_name, patch) => {
        const res = await request(app).post('/api/budget/income').set('Authorization', auth).send({ ...income, ...patch });
        expect(res.status).toBe(400);
    });

    test('rejects savings goals over 100%', async () => {
        const res = await request(app).post('/api/budget/saving').set('Authorization', auth)
            .send({ goalName: 'X', goalAmount: 10, allocatedPercentage: 150 });
        expect(res.status).toBe(400);
    });
});

test('health endpoint and unknown routes', async () => {
    expect((await request(app).get('/health')).body).toEqual({ status: 'ok' });
    expect((await request(app).get('/nope')).status).toBe(404);
});
