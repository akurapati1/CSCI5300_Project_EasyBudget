# Budget and Savings Management Application

## Overview
This project is a full-stack web application designed to help users manage their budget and savings goals. The application is built using React for the frontend and Node.js with Express for the backend. MongoDB is used as the database to store user data, budget, and savings goals.

## Features
- User Registration and Login
- User Authentication with JWT
- Manage Income, Expenses, and Savings Goals
- Context API for Global State Management in React
- RESTful API for Budget and Savings Management

## Tech Stack
- Frontend: React, Context API, CSS
- Backend: Node.js, Express, MongoDB, Mongoose
- Authentication: JWT (JSON Web Tokens)

## Getting Started

### Prerequisites
- Node.js
- npm (Node Package Manager)
- MongoDB (local or MongoDB Atlas)

### Installation

#### Clone the Repository
```bash
git clone https://github.com/yourusername/budget-savings-app.git
cd budget-savings-app

Backend Setup
Navigate to the backend directory:
->cd backend

Install backend dependencies:

bash
npm install
Create a .env file in the backend directory and add the following environment variables:

makefile
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
Start the backend server:

bash
npm start
The backend server will start on http://localhost:5001.

Frontend Setup
Navigate to the frontend directory:

bash
cd frontend
Install frontend dependencies:

bash
npm install
Start the frontend server:

bash
npm start
The frontend server will start on http://localhost:3000.


Project Structure
Backend
bash
backend/
├── controllers/
│   ├── budgetController.js
│   ├── savingsController.js
│   └── userController.js
├── models/
│   ├── Budget.js
│   ├── SavingsGoal.js
│   └── User.js
├── routes/
│   ├── budgetRoutes.js
│   ├── savingsRoutes.js
│   └── userRoutes.js
├── .env
├── server.js
└── package.json


Frontend
java
frontend/
├── public/
├── src/
│   ├── components/
│   │   ├── BudgetForm.js
│   │   ├── BudgetList.js
│   │   ├── Dashboard.js
│   │   ├── LoginForm.js
│   │   ├── RegisterForm.js
│   │   ├── SavingsGoalForm.js
│   │   └── SavingsGoalList.js
│   ├── context/
│   │   └── UserContext.js
│   ├── App.js
│   ├── index.js
│   └── package.json

Usage

Register and Login
Open the application in your browser at http://localhost:3000.
Register a new account or login with an existing account.
Once logged in, you can add and manage your budget and savings goals.
Managing Budget
Navigate to the "Budget" section.
Add a new budget entry using the "Add Budget" button.
View and manage your budget entries.
Managing Savings Goals
Navigate to the "Savings Goals" section.
Add a new savings goal using the "Add Savings Goal" button.
View and manage your savings goals.

API Endpoints
User
POST /api/register - Register a new user
POST /api/login - Login an existing user
Budget
POST /api/budget - Add a new budget entry
GET /api/budget/:userId - Get budget entries for a user
Savings Goals
POST /api/savings - Add a new savings goal
GET /api/savings/:userId - Get savings goals for a user


Contributing
Contributions are welcome! Please fork the repository and create a pull request.

License
This project is licensed under the MIT License. See the LICENSE file for details.

Contact
For any questions or feedback, please contact [abhilash.kurapati@slu.edu].


