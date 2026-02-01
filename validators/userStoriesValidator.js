import Joi from 'joi';

export const createUserStorySchema = Joi.object({
   role: Joi.string().max(100).required().messages({
      'any.required': 'Rôle requis'
   }),
   action: Joi.string().min(3).max(500).required().messages({
      'string.min': 'L\'action doit contenir au moins 3 caractères',
      'any.required': 'Action requise'
   }),
   need: Joi.string().min(3).max(500).required().messages({
      'string.min': 'Le besoin doit contenir au moins 3 caractères',
      'any.required': 'Besoin requis'
   }),
   status: Joi.string().valid('todo', 'doing', 'done').default('todo').required(),
   priority: Joi.string().valid('low', 'medium', 'high').default('low').required(),
   userIds: Joi.array().items(Joi.number().integer()).optional()
});

export const updateUserStorySchema = Joi.object({
   role: Joi.string().max(100).optional(),
   action: Joi.string().min(3).max(500).optional(),
   need: Joi.string().min(3).max(500).optional(),
   status: Joi.string().valid('todo', 'doing', 'done').optional(),
   priority: Joi.string().valid('low', 'medium', 'high').optional(),
   userIds: Joi.array().items(Joi.number().integer()).optional()
}).min(1).messages({
   'object.min': 'Au moins un champ doit être fourni pour la mise à jour'
});
