import { UserStories, User } from '../models/index.js';

export const getUserStories = async (req, res) => {
    try {
        const { user } = req;
        const { id } = user;
        const userStories = await UserStories.findAll({ where: { assignedToId: id } });
        res.status(200).json({ 
            success: true,
            data: userStories 
        });
    } catch (error) {
        res.status(500).json({ 
            success: false,
            message: 'Erreur lors de la récupération des user stories' 
        });
    }
};

export const getUserStoryById = async (req, res, next) => {
   try {
       const { id } = req.params;
       const userStory = await UserStories.findByPk(id, { include: [{ model: User, as: 'assignee' }] });
       
       if (!userStory) {
           return res.status(404).json({ 
               success: false,
               message: 'User Story introuvable' 
           });
       }
       
       res.status(200).json({ 
           success: true,
           data: userStory 
       });
   } catch (error) {
       next(error);
   }
};

export const createUserStory = async (req, res, next) => {
   try {
       const { action, need, status, priority, userIds, role } = req.body;

       if (!action || !need) {
           return res.status(400).json({ 
               success: false,
               error: 'Les champs action et need sont obligatoires' 
           });
       }

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

       res.status(201).json({ 
           success: true,
           data: {...userStory.toJSON(), id: userStory.id} 
       });
   } catch (error) {
       console.error("Erreur dans createUserStory:", error);
       next(error);
   }
};

export const updateUserStory = async (req, res, next) => {
   try {
       const { id } = req.params;
       const updateData = { ...req.body };

       const userStory = await UserStories.findByPk(id);

       // Vérifier d'abord si la ressource existe
       if (!userStory) {
           return res.status(404).json({ 
               success: false,
               message: 'User Story introuvable' 
           });
       }

       // Ensuite vérifier l'autorisation
       if (userStory.assignedToId !== req.user.id) {
           return res.status(403).json({ 
               success: false,
               message: 'Vous n\'êtes pas autorisé à modifier cette user story' 
           });
       }

       await UserStories.update(updateData, { where: { id } });

       res.status(200).json({ 
           success: true,
           data: updateData 
       });
   } catch (error) {
       next(error);
   }
};

export const deleteUserStory = async (req, res, next) => {
   try {
       const { id } = req.params;

       const userStory = await UserStories.findByPk(id);

       // Vérifier d'abord si la ressource existe
       if (!userStory) {
           return res.status(404).json({ 
               success: false,
               message: 'User Story introuvable' 
           });
       }

       // Ensuite vérifier l'autorisation
       if (userStory.assignedToId !== req.user.id) {
           return res.status(403).json({ 
               success: false,
               message: 'Vous n\'êtes pas autorisé à supprimer cette user story' 
           });
       }

       await UserStories.destroy({ where: { id } });

       res.status(200).json({ 
           success: true,
           message: 'User Story supprimée avec succès' 
       });
   } catch (error) {
       next(error);
   }
};
