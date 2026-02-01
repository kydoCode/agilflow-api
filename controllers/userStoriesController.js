import { UserStories, User } from '../models/index.js';
import { NotFoundError, AuthorizationError } from '../utils/errors/AppError.js';
import { sendSuccess } from '../utils/responses/apiResponse.js';

export const getUserStories = async (req, res, next) => {
    try {
        const { user } = req;
        const { id } = user;
        const userStories = await UserStories.findAll({ where: { assignedToId: id } });
        sendSuccess(res, userStories);
    } catch (error) {
        next(error);
    }
};

export const getUserStoryById = async (req, res, next) => {
   try {
       const { id } = req.params;
       const userStory = await UserStories.findByPk(id);
       
       if (!userStory) {
           throw new NotFoundError('User Story introuvable');
       }
       
       sendSuccess(res, userStory);
   } catch (error) {
       next(error);
   }
};

export const createUserStory = async (req, res, next) => {
   try {
       const { action, need, status, priority, userIds, role } = req.body;

       const userStory = await UserStories.create({
           role,
           action,
           need,
           status: status || 'todo',
           priority: priority || 'medium',
           assignedToId: req.user ? req.user.id : null,
       });

       if (userIds && userIds.length > 0) {
           const users = await User.findAll({ where: { id: userIds } });
           await userStory.addUsersInvolved(users);
       }

       sendSuccess(res, {...userStory.toJSON(), id: userStory.id}, 'User Story créée avec succès', 201);
   } catch (error) {
       next(error);
   }
};

export const updateUserStory = async (req, res, next) => {
   try {
       const { id } = req.params;
       const updateData = { ...req.body };

       const userStory = await UserStories.findByPk(id);

       if (!userStory) {
           throw new NotFoundError('User Story introuvable');
       }

       if (userStory.assignedToId !== req.user.id) {
           throw new AuthorizationError('Vous n\'êtes pas autorisé à modifier cette user story');
       }

       await UserStories.update(updateData, { where: { id } });

       sendSuccess(res, updateData, 'User Story mise à jour avec succès');
   } catch (error) {
       next(error);
   }
};

export const deleteUserStory = async (req, res, next) => {
   try {
       const { id } = req.params;

       const userStory = await UserStories.findByPk(id);

       if (!userStory) {
           throw new NotFoundError('User Story introuvable');
       }

       if (userStory.assignedToId !== req.user.id) {
           throw new AuthorizationError('Vous n\'êtes pas autorisé à supprimer cette user story');
       }

       await UserStories.destroy({ where: { id } });

       sendSuccess(res, null, 'User Story supprimée avec succès');
   } catch (error) {
       next(error);
   }
};
