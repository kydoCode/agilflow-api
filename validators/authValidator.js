import Joi from 'joi';

export const registerSchema = Joi.object({
   email: Joi.string().email().required().messages({
      'string.email': 'Email invalide',
      'any.required': 'Email requis'
   }),
   name: Joi.string().min(2).max(100).required().messages({
      'string.min': 'Le nom doit contenir au moins 2 caractères',
      'any.required': 'Nom requis'
   }),
   password: Joi.string().min(6).required().messages({
      'string.min': 'Le mot de passe doit contenir au moins 6 caractères',
      'any.required': 'Mot de passe requis'
   }),
   role: Joi.string().valid('developer', 'product_owner', 'scrum_master').required().messages({
      'any.only': 'Rôle invalide',
      'any.required': 'Rôle requis'
   })
});

export const loginSchema = Joi.object({
   email: Joi.string().email().required().messages({
      'string.email': 'Email invalide',
      'any.required': 'Email requis'
   }),
   password: Joi.string().required().messages({
      'any.required': 'Mot de passe requis'
   })
});

export const changePasswordSchema = Joi.object({
   oldPassword: Joi.string().required().messages({
      'any.required': 'Ancien mot de passe requis'
   }),
   newPassword: Joi.string().min(6).required().messages({
      'string.min': 'Le nouveau mot de passe doit contenir au moins 6 caractères',
      'any.required': 'Nouveau mot de passe requis'
   })
});
