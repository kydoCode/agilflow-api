import jwt from 'jsonwebtoken';
import { User } from '../models/index.js';
import dotenv from 'dotenv';

dotenv.config();

const authMiddleware = async (req, res, next) => {
   try {
      // Vérifier la présence du header Authorization
      const authHeader = req.headers.authorization;
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
         return res.status(401).json({ 
            success: false,
            error: 'Token manquant ou format invalide. Format attendu: Bearer <token>' 
         });
      }

      // Extraire le token
      const token = authHeader.split(' ')[1];

      if (!token) {
         return res.status(401).json({ 
            success: false,
            error: 'Token manquant' 
         });
      }

      // Vérifier et décoder le token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Récupérer l'utilisateur
      const user = await User.findByPk(decoded.id);

      if (!user) {
         return res.status(401).json({ 
            success: false,
            error: 'Utilisateur non trouvé ou token invalide' 
         });
      }

      // Attacher l'utilisateur à la requête
      req.user = user;
      next();
   } catch (error) {
      // Gestion des erreurs spécifiques JWT
      if (error.name === 'TokenExpiredError') {
         return res.status(401).json({ 
            success: false,
            error: 'Token expiré. Veuillez vous reconnecter' 
         });
      }
      
      if (error.name === 'JsonWebTokenError') {
         return res.status(401).json({ 
            success: false,
            error: 'Token invalide' 
         });
      }

      // Erreur générique
      res.status(401).json({ 
         success: false,
         error: 'Authentification échouée' 
      });
   }
};

export default authMiddleware;