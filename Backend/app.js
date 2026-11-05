const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const app = express();

app.disable('x-powered-by');
app.use(helmet());
app.use(express.json({ limit: '100kb' }));
app.use(cors({
    origin: (process.env.CLIENT_ORIGIN || 'http://localhost:3000').split(',').map((o) => o.trim()),
    credentials: true
}));

// Throttle credential endpoints to slow brute-force and e-mail-bomb attempts.
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: Number(process.env.AUTH_RATE_LIMIT || 100),
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: 'Too many requests, please try again later.' }
});

app.use('/auth', authLimiter, require('./routes/auth'));
app.use('/api/budget', require('./routes/budgetRoutes'));

app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.use((req, res) => res.status(404).json({ message: 'Not found.' }));

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
    console.error(err);
    res.status(err.status || 500).json({ message: err.status && err.status < 500 ? err.message : 'Internal server error.' });
});

module.exports = app;
