import express from 'express';
import { 
    getUserStories, 
    getUserStoryById, 
    createUserStory, 
    updateUserStory, 
    deleteUserStory 
} from '../controllers/userStoriesController.js';
import authMiddleware from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { createUserStorySchema, updateUserStorySchema } from '../validators/userStoriesValidator.js';

const router = express.Router();

router.get('/', authMiddleware, getUserStories);
router.get('/:id', authMiddleware, getUserStoryById);
router.post('/', authMiddleware, validate(createUserStorySchema), createUserStory);
router.put('/:id', authMiddleware, validate(updateUserStorySchema), updateUserStory);
router.delete('/:id', authMiddleware, deleteUserStory);

export default router;