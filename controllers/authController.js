import { User } from '../models/index.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Durée de validité du token : 1 heure
const TOKEN_EXPIRATION = '1h';

export const login = async (req, res) => {
   try {
      const { email, password } = req.body;
      const user = await User.findOne({ where: { email } });
      if (!user) {
         return res.status(400).json({ message: 'User not found' });
      }

      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
         return res.status(400).json({ message: 'Invalid email or password' });
      }

      // Générer le token avec expiration
      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role }, 
        process.env.JWT_SECRET,
        { expiresIn: TOKEN_EXPIRATION }
      );
      // Remove password from response
      const userToReturn = user.get({ plain: true });
      delete userToReturn.password;
      delete userToReturn.createdAt;
      delete userToReturn.updatedAt;

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
      console.error(error);
      res.status(500).json({ 
        success: false,
        message: 'Erreur lors de la connexion' 
      });
   }
}

export const register = async (req, res) => {
   try {
      const { email, name, password, role } = req.body;

      // Basic validation
      if (!name || !email || !password || !role) {
         return res.status(400).json({ message: 'All fields are required' });
      }

      const user = await User.findOne({ where: { email } });
      if (user) {
         return res.status(400).json({ message: 'User already exists' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = await User.create({ email, name, password: hashedPassword, role });
      // Générer le token avec expiration
      const token = jwt.sign(
        { id: newUser.id, email: newUser.email, role: newUser.role }, 
        process.env.JWT_SECRET,
        { expiresIn: TOKEN_EXPIRATION }
      );

      // Retirer le mot de passe de la réponse
      const userToReturn = newUser.get({ plain: true });
      delete userToReturn.password;

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
      console.error(error);
      res.status(500).json({ 
        success: false,
        message: 'Erreur lors de la création de l\'utilisateur' 
      });
   }
}