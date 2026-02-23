import express from 'express';
const router = express.Router();
import { registerUser, loginUser, updateUser } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

router.post('/register', registerUser);
router.post('/login', loginUser);
router.put('/update', protect, updateUser);

export default router;
