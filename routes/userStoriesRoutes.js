import express from 'express';
import { 
    getUserStories, 
    getUserStoryById, 
    createUserStory, 
    updateUserStory, 
    deleteUserStory 
} from '../controllers/userStoriesController.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

router.get('/', authMiddleware, getUserStories);
router.get('/:id', authMiddleware, getUserStoryById);
router.post('/', authMiddleware, createUserStory);
router.put('/:id', authMiddleware, updateUserStory);
router.delete('/:id', authMiddleware, deleteUserStory);

export default router;