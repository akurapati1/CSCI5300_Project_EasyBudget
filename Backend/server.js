

//next code
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');

// Creating an express application
const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(bodyParser.json());
app.use(cors({
  origin: ['https://your-frontend-service.onrender.com'], // Replace with your actual frontend URL
  credentials: true
}));


// Database connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('MongoDB Atlas connected...');
}).catch(err => {
  console.error('MongoDB connection error:', err);
});

// Routes Setup
const authRoutes = require('./routes/auth');
const budgetRoutes = require('./routes/budgetRoutes');




app.use('/auth', authRoutes);
app.use('/api', budgetRoutes);



// Routes
app.get('/', (req, res) => {
  res.send('Hello, World!');
});

// Starting the Server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

const path = require('path');

// Serve static files from the React app
app.use(express.static(path.join(__dirname, 'build')));

// Catch-all handler to serve React's index.html for any route not handled by backend
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});



