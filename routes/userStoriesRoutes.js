const express = require('express');
const router = express.Router();
const userStoriesController = require('../controllers/userStoriesController');
const authMiddleware = require('../middleware/auth');
const cors = require('cors');

router.options('*', cors()); // Ajoutez cette ligne
router.get('/', authMiddleware, userStoriesController.getUserStories);
router.get('/:id', authMiddleware, userStoriesController.getUserStoryById);
router.post('/', authMiddleware, userStoriesController.createUserStory);
router.put('/:id', authMiddleware, userStoriesController.updateUserStory);
router.delete('/:id', authMiddleware, userStoriesController.deleteUserStory);

module.exports = router;