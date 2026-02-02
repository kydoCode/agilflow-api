import { UserStories, User } from '../models/index.js';
import { Op } from 'sequelize';
import { NotFoundError, AuthorizationError } from '../utils/errors/AppError.js';
import { sendSuccess } from '../utils/responses/apiResponse.js';

export const getUserStories = async (req, res, next) => {
    try {
        const { user } = req;
        const { id } = user;
        
        // Pagination
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;
        
        // Filtres
        const where = { assignedToId: id };
        if (req.query.status) where.status = req.query.status;
        if (req.query.priority) where.priority = req.query.priority;
        
        // Recherche textuelle
        if (req.query.search) {
            where[Op.or] = [
                { action: { [Op.iLike]: `%${req.query.search}%` } },
                { need: { [Op.iLike]: `%${req.query.search}%` } }
            ];
        }
        
        // Tri
        const sortBy = req.query.sortBy || 'createdAt';
        const order = req.query.order === 'asc' ? 'ASC' : 'DESC';
        
        const { count, rows } = await UserStories.findAndCountAll({
            where,
            limit,
            offset,
            order: [[sortBy, order]]
        });
        
        const totalPages = Math.ceil(count / limit);
        
        sendSuccess(res, {
            userStories: rows,
            pagination: {
                currentPage: page,
                totalPages,
                totalItems: count,
                itemsPerPage: limit
            }
        });
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
