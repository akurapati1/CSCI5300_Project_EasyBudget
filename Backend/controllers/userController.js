const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { validateTransaction, validateSavingsGoal } = require('../utils/validators');

// Only a SHA-256 digest of the reset token is stored, so a database leak cannot be used to take over accounts.
const hashToken = (token) => crypto.createHash('sha256').update(token).digest('hex');
const { sendPasswordResetEmail } = require('../utils/mailer');

// Password strength: min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/;

exports.getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password -resetPasswordToken -resetPasswordExpires');
        if (!user) return res.status(404).json({ message: 'User not found.' });
        res.json({
            id: user._id,
            username: user.username,
            income: user.income,
            expenses: user.expenses,
            savingsGoals: user.savingsGoals
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching user.' });
    }
};

exports.register = async (req, res) => {
    const { password } = req.body;
    const username = typeof req.body.username === 'string' ? req.body.username.trim() : req.body.username;
    const email = typeof req.body.email === 'string' ? req.body.email.trim().toLowerCase() : req.body.email;
    if (typeof username !== 'string' || typeof password !== 'string' || !username.trim() || !password) return res.status(400).json({ message: 'Username and password are required.' });
    if (!email) return res.status(400).json({ message: 'Email is required for account recovery.' });
    if (!PASSWORD_REGEX.test(password)) {
        return res.status(400).json({
            message: 'Password must be at least 8 characters and include uppercase, lowercase, a number, and a special character.'
        });
    }
    try {
        const existing = await User.findOne({ username });
        if (existing) return res.status(409).json({ message: 'Username already taken.' });
        const hashedPassword = await bcrypt.hash(password, 12);
        const newUser = new User({ username, email, password: hashedPassword });
        await newUser.save();
        res.status(201).json({ message: 'User registered successfully.' });
    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).json({ message: 'Error registering user.' });
    }
};

exports.login = async (req, res) => {
    const { username, password } = req.body;
    // Reject non-strings so objects like {"$ne": null} can never reach the query (NoSQL injection).
    if (typeof username !== 'string' || typeof password !== 'string' || !username || !password) {
        return res.status(400).json({ message: 'Username and password are required.' });
    }
    try {
        const user = await User.findOne({ username });
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ message: 'Invalid credentials.' });
        }
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
        res.json({
            token,
            user: {
                id: user._id,
                username: user.username,
                income: user.income,
                expenses: user.expenses,
                savingsGoals: user.savingsGoals
            }
        });
    } catch (error) {
        console.error('Error logging in:', error);
        res.status(500).json({ message: 'Error logging in.' });
    }
};

exports.forgotPassword = async (req, res) => {
    const { email } = req.body;
    if (typeof email !== 'string' || !email) return res.status(400).json({ message: 'Email is required.' });
    try {
        const user = await User.findOne({ email: email.toLowerCase().trim() });
        // Always respond the same way to prevent email enumeration
        if (!user) {
            return res.json({ message: 'If that email is registered, a reset link has been sent.' });
        }
        const token = crypto.randomBytes(32).toString('hex');
        user.resetPasswordToken = hashToken(token);
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
        await user.save();

        const clientOrigin = process.env.CLIENT_ORIGIN || 'http://localhost:3000';
        const resetUrl = `${clientOrigin}/reset-password/${token}`;
        await sendPasswordResetEmail(user.email, resetUrl);
        res.json({ message: 'If that email is registered, a reset link has been sent.' });
    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({ message: 'Error sending reset email.' });
    }
};

exports.resetPassword = async (req, res) => {
    const { token } = req.params;
    const { password } = req.body;
    if (typeof password !== 'string' || !password) return res.status(400).json({ message: 'New password is required.' });
    if (!PASSWORD_REGEX.test(password)) {
        return res.status(400).json({
            message: 'Password must be at least 8 characters and include uppercase, lowercase, a number, and a special character.'
        });
    }
    try {
        const user = await User.findOne({
            resetPasswordToken: hashToken(token),
            resetPasswordExpires: { $gt: Date.now() }
        });
        if (!user) return res.status(400).json({ message: 'Reset link is invalid or has expired.' });
        user.password = await bcrypt.hash(password, 12);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();
        res.json({ message: 'Password reset successfully. You can now sign in.' });
    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({ message: 'Error resetting password.' });
    }
};

exports.addIncome = async (req, res) => {
    const { date, amount, description, frequency } = req.body;
    const invalid = validateTransaction(req.body);
    if (invalid) return res.status(400).json({ message: invalid });
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: 'User not found.' });
        user.income.push({ date, amount, description, frequency });
        await user.save();
        res.status(201).json(user.income[user.income.length - 1]);
    } catch (error) {
        res.status(500).json({ message: 'Error adding income.' });
    }
};

exports.addExpense = async (req, res) => {
    const { date, amount, description, frequency } = req.body;
    const invalid = validateTransaction(req.body);
    if (invalid) return res.status(400).json({ message: invalid });
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: 'User not found.' });
        user.expenses.push({ date, amount, description, frequency });
        await user.save();
        res.status(201).json(user.expenses[user.expenses.length - 1]);
    } catch (error) {
        res.status(500).json({ message: 'Error adding expense.' });
    }
};

exports.addSavingsGoal = async (req, res) => {
    const { goalName, goalAmount, allocatedPercentage } = req.body;
    const invalid = validateSavingsGoal(req.body);
    if (invalid) return res.status(400).json({ message: invalid });
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: 'User not found.' });
        user.savingsGoals.push({ goalName, goalAmount, allocatedPercentage });
        await user.save();
        res.status(201).json(user.savingsGoals[user.savingsGoals.length - 1]);
    } catch (error) {
        res.status(500).json({ message: 'Error adding savings goal.' });
    }
};

exports.deleteIncome = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: 'User not found.' });
        user.income = user.income.filter(item => item._id.toString() !== req.params.id);
        await user.save();
        res.json({ message: 'Income deleted.' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting income.' });
    }
};

exports.deleteExpense = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: 'User not found.' });
        user.expenses = user.expenses.filter(item => item._id.toString() !== req.params.id);
        await user.save();
        res.json({ message: 'Expense deleted.' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting expense.' });
    }
};

exports.deleteSavingsGoal = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: 'User not found.' });
        user.savingsGoals = user.savingsGoals.filter(item => item._id.toString() !== req.params.id);
        await user.save();
        res.json({ message: 'Savings goal deleted.' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting savings goal.' });
    }
};
