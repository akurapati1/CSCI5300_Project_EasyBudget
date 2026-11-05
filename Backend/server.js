require('dotenv').config();
const mongoose = require('mongoose');

const missing = ['MONGODB_URI', 'JWT_SECRET'].filter((name) => !process.env[name]);
if (missing.length) {
    console.error(`Missing required environment variable(s): ${missing.join(', ')}`);
    process.exit(1);
}

const app = require('./app');
const PORT = process.env.PORT || 5001;

mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
        console.log('MongoDB connected.');
        app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
    })
    .catch((err) => {
        console.error('MongoDB connection error:', err);
        process.exit(1);
    });
