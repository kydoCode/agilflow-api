import { User } from '../models/index.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import logger from '../config/logger.js';

// Durée de validité du token : 1 heure
const TOKEN_EXPIRATION = '1h';

export const login = async (req, res) => {
   try {
      const { email, password } = req.body;
      const user = await User.findOne({ where: { email } });
      if (!user) {
         logger.warn(`Tentative de connexion échouée - utilisateur introuvable: ${email}`);
         return res.status(400).json({ message: 'User not found' });
      }

      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
         logger.warn(`Tentative de connexion échouée - mot de passe invalide: ${email}`);
         return res.status(400).json({ message: 'Invalid email or password' });
      }

      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role }, 
        process.env.JWT_SECRET,
        { expiresIn: TOKEN_EXPIRATION }
      );
      
      const userToReturn = user.get({ plain: true });
      delete userToReturn.password;
      delete userToReturn.createdAt;
      delete userToReturn.updatedAt;

      logger.info(`Connexion réussie: ${email}`);
      res.status(200).json({ 
        success: true,
        message: 'Connexion réussie', 
        data: {
          user: userToReturn, 
          token,
          expiresIn: TOKEN_EXPIRATION
        }
      });
   } catch (error) {
      logger.error('Erreur lors de la connexion', { error: error.message, stack: error.stack });
      res.status(500).json({ 
        success: false,
        message: 'Erreur lors de la connexion' 
      });
   }
}

export const register = async (req, res) => {
   try {
      const { email, name, password, role } = req.body;

      const user = await User.findOne({ where: { email } });
      if (user) {
         logger.warn(`Tentative d'inscription avec email existant: ${email}`);
         return res.status(400).json({ message: 'User already exists' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = await User.create({ email, name, password: hashedPassword, role });
      
      const token = jwt.sign(
        { id: newUser.id, email: newUser.email, role: newUser.role }, 
        process.env.JWT_SECRET,
        { expiresIn: TOKEN_EXPIRATION }
      );

      const userToReturn = newUser.get({ plain: true });
      delete userToReturn.password;

      logger.info(`Nouvel utilisateur créé: ${email}`);
      res.status(201).json({ 
        success: true,
        message: 'Utilisateur créé avec succès', 
        data: {
          user: userToReturn, 
          token,
          expiresIn: TOKEN_EXPIRATION
        }
      });
   } catch (error) {
      logger.error('Erreur lors de la création de l\'utilisateur', { error: error.message, stack: error.stack });
      res.status(500).json({ 
        success: false,
        message: 'Erreur lors de la création de l\'utilisateur' 
      });
   }
}

export const getProfile = async (req, res) => {
   try {
      const user = await User.findByPk(req.user.id);
      if (!user) {
         return res.status(404).json({ 
            success: false,
            message: 'Utilisateur introuvable' 
         });
      }

      const userToReturn = user.get({ plain: true });
      delete userToReturn.password;
      delete userToReturn.updatedAt;

      res.status(200).json(userToReturn);
   } catch (error) {
      logger.error('Erreur lors de la récupération du profil', { error: error.message });
      res.status(500).json({ 
         success: false,
         message: 'Erreur serveur' 
      });
   }
}

export const changePassword = async (req, res) => {
   try {
      const { oldPassword, newPassword } = req.body;
      const user = await User.findByPk(req.user.id);

      if (!user) {
         return res.status(404).json({ 
            success: false,
            message: 'Utilisateur introuvable' 
         });
      }

      const validPassword = await bcrypt.compare(oldPassword, user.password);
      if (!validPassword) {
         logger.warn(`Tentative de changement de mot de passe échouée - ancien mot de passe invalide: ${user.email}`);
         return res.status(400).json({ 
            success: false,
            message: 'Ancien mot de passe incorrect' 
         });
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await user.update({ password: hashedPassword });

      logger.info(`Mot de passe modifié: ${user.email}`);
      res.status(200).json({ 
         success: true,
         message: 'Mot de passe modifié avec succès' 
      });
   } catch (error) {
      logger.error('Erreur lors du changement de mot de passe', { error: error.message });
      res.status(500).json({ 
         success: false,
         message: 'Erreur serveur' 
      });
   }
}