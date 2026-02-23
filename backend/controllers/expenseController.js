import mongoose from 'mongoose';
import Expense from '../models/Expense.js';

// @desc    Get expenses for user
// @route   GET /api/expenses
// @access  Private
export const getExpenses = async (req, res) => {
    try {
        const match = { userId: req.user.id };

        if (req.query.category) {
            match.category = req.query.category;
        }

        if (req.query.year) {
            const year = parseInt(req.query.year);
            let startDate, endDate;

            if (req.query.month) {
                const month = parseInt(req.query.month) - 1; // JS months are 0-indexed
                startDate = new Date(year, month, 1);
                endDate = new Date(year, month + 1, 0, 23, 59, 59, 999);
            } else {
                startDate = new Date(year, 0, 1);
                endDate = new Date(year, 11, 31, 23, 59, 59, 999);
            }
            match.date = { $gte: startDate, $lte: endDate };
        }

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const startIndex = (page - 1) * limit;

        const expenses = await Expense.find(match)
            .sort({ date: -1 })
            .skip(startIndex)
            .limit(limit);

        res.status(200).json(expenses);
    } catch (error) {
        res.status(500).json({ message: 'Server error: ' + error.message });
    }
};

// @desc    Get expense summary for user (Total Amount & Count)
// @route   GET /api/expenses/summary
// @access  Private
export const getExpenseSummary = async (req, res) => {
    try {
        const summary = await Expense.aggregate([
            {
                $match: { userId: new mongoose.Types.ObjectId(req.user.id) }
            },
            {
                $group: {
                    _id: null,
                    totalAmount: { $sum: '$amount' },
                    expenseCount: { $sum: 1 }
                }
            }
        ]);

        if (summary.length === 0) {
            return res.status(200).json({
                totalAmount: 0,
                expenseCount: 0
            });
        }

        res.status(200).json({
            totalAmount: summary[0].totalAmount,
            expenseCount: summary[0].expenseCount
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error: ' + error.message });
    }
};

// @desc    Set expense
// @route   POST /api/expenses
// @access  Private
export const setExpense = async (req, res) => {
    try {
        const { title, amount, category, date } = req.body;

        if (!title || !amount || !category) {
            return res.status(400).json({ message: 'Please add all required fields' });
        }

        const expense = await Expense.create({
            title,
            amount,
            category,
            date: date || undefined,
            userId: req.user.id,
        });

        res.status(201).json(expense);
    } catch (error) {
        res.status(500).json({ message: 'Server error: ' + error.message });
    }
};

// @desc    Update expense
// @route   PUT /api/expenses/:id
// @access  Private
export const updateExpense = async (req, res) => {
    try {
        const expense = await Expense.findById(req.params.id);

        if (!expense) {
            return res.status(404).json({ message: 'Expense not found' });
        }

        // Check for user
        if (!req.user) {
            return res.status(401).json({ message: 'User not found' });
        }

        // Make sure the logged in user matches the expense user
        if (expense.userId.toString() !== req.user.id) {
            return res.status(401).json({ message: 'User not authorized' });
        }

        const updatedExpense = await Expense.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        res.status(200).json(updatedExpense);
    } catch (error) {
        res.status(500).json({ message: 'Server error: ' + error.message });
    }
};

// @desc    Delete expense
// @route   DELETE /api/expenses/:id
// @access  Private
export const deleteExpense = async (req, res) => {
    try {
        const expense = await Expense.findById(req.params.id);

        if (!expense) {
            return res.status(404).json({ message: 'Expense not found' });
        }

        // Check for user
        if (!req.user) {
            return res.status(401).json({ message: 'User not found' });
        }

        // Make sure the logged in user matches the expense user
        if (expense.userId.toString() !== req.user.id) {
            return res.status(401).json({ message: 'User not authorized' });
        }

        await expense.deleteOne();

        res.status(200).json({ id: req.params.id, message: 'Expense deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Server error: ' + error.message });
    }
};
