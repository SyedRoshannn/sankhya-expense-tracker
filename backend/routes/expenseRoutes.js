import express from 'express';
const router = express.Router();
import {
    getExpenses,
    getExpenseSummary,
    setExpense,
    updateExpense,
    deleteExpense,
} from '../controllers/expenseController.js';
import { protect } from '../middleware/authMiddleware.js';

router.route('/summary').get(protect, getExpenseSummary);
router.route('/').get(protect, getExpenses).post(protect, setExpense);
router.route('/:id').delete(protect, deleteExpense).put(protect, updateExpense);

export default router;
