const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true, trim: true },
    email: { type: String, trim: true, lowercase: true },
    password: { type: String, required: true },
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },
    income: [
        {
            date: { type: Date, required: true },
            amount: { type: Number, required: true },
            description: { type: String, required: true },
            frequency: { type: String, required: true, enum: ['weekly', 'bi-weekly', 'monthly'] }
        }
    ],
    expenses: [
        {
            date: { type: Date, required: true },
            amount: { type: Number, required: true },
            description: { type: String, required: true },
            frequency: { type: String, required: true, enum: ['weekly', 'bi-weekly', 'monthly'] }
        }
    ],
    savingsGoals: [
        {
            goalName: { type: String, required: true },
            goalAmount: { type: Number, required: true },
            allocatedPercentage: { type: Number, required: true }
        }
    ]
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
