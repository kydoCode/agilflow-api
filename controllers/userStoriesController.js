const { UserStories, User } = require('../models');

//  getUserStories
exports.getUserStories = async (req, res) => {
    try {
        const { user } = req;
        const { id } = user;
        const userStories = await UserStories.findAll({ where: { assignedToId: id } });
        console.log("userStories:", userStories);
        res.status(200).json(userStories);
    } catch (error) {
        res.status(500).json({ message: 'Error getting user stories' });
    }
};

exports.getUserStoryById = async (req, res, next) => {
   try {
       const { id } = req.params;
       const userStory = await UserStories.findByPk(id, { include: [{ model: User, as: 'assignee' }] });
       if (!userStory) {
           return res.status(404).json({ message: 'User Story not found' });
       }
       res.status(200).json(userStory);
   } catch (error) {
       next(error);
   }
};

exports.createUserStory = async (req, res, next) => {
   try {
       const { action, need, status, priority, userIds, role } = req.body;

       // Validate required fields
       if (!action || !need) {
           return res.status(400).json({ error: 'Action and need are required fields.' });
       }

       const userStory = await UserStories.create({
           role,
           action,
           need,
           status: status || 'todo',
           priority: priority || 'medium',
           assignedToId: req.user ? req.user.id : null, // Assign user story to the logged-in user if available, otherwise set to null
       });

       if (userIds && userIds.length > 0) {
           const users = await User.findAll({ where: { id: userIds } });
           await userStory.addUsersInvolved(users);
       }

       res.status(201).json({...userStory.toJSON(), id: userStory.id});
   } catch (error) {
       console.error("Error in createUserStory:", error);
       next(error);
   }
};

exports.updateUserStory = async (req, res, next) => {
   try {
       const { id } = req.params;
   
       const updateData = { ...req.body };

       const userStory = await UserStories.findByPk(id)

       if (userStory.assignedToId !== req.user.id) {
           return res.status(403).json({ message: 'You are not authorized to update this user story.' });
       }


       const updated = await UserStories.update(updateData, {
           where: { id }
       })

       if (!updated) {
           return res.status(404).json({ message: 'User Story not found' });
       }
       res.status(200).json(updateData);
   } catch (error) {
       next(error);
   }
};

exports.deleteUserStory = async (req, res, next) => {
   try {
       const { id } = req.params;

       const userStory = await UserStories.findByPk(id)

       if (userStory.assignedToId !== req.user.id) {
        return res.status(403).json({ message: 'You are not authorized to delete this user story.' });
    }

       const deleted = await UserStories.destroy({
           where: { id },
       });

       if (!deleted) {
           return res.status(404).json({ message: 'User Story not found' });
       }

       // we shall return the deleted user story and message
       res.status(200).json({ message: 'User Story deleted successfully'});
       // res.status(204).end();
   } catch (error) {
       next(error);
   }
};
