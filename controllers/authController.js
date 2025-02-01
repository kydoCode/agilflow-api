const { User } = require('../models');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.login = async (req, res) => {
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

      const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET);
      // Remove password from response
      const userToReturn = user.get({ plain: true });
      delete userToReturn.password;
      delete userToReturn.createdAt;
      delete userToReturn.updatedAt;

      res.status(200).json({ message: 'Logged in successfully', user: userToReturn, token });
   } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error logging in user' });
   }
}

exports.register = async (req, res) => {
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
      const token = jwt.sign({ id: newUser.id }, process.env.JWT_SECRET);

      res.status(201).json({ message: 'User created successfully', user: newUser, token });
   } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error creating user' });
   }
}