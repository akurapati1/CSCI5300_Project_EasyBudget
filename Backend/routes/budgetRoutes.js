const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const userController = require('../controllers/userController');

// All budget routes require authentication
router.post('/income', authMiddleware, userController.addIncome);
router.post('/expense', authMiddleware, userController.addExpense);
router.post('/saving', authMiddleware, userController.addSavingsGoal);
router.delete('/income/:id', authMiddleware, userController.deleteIncome);
router.delete('/expense/:id', authMiddleware, userController.deleteExpense);
router.delete('/saving/:id', authMiddleware, userController.deleteSavingsGoal);

module.exports = router;
