
const express = require('express');
const bcrypt = require('bcryptjs');
const {userValidator} = require('../schema/schema');
const { insertSingleDocument, findDocuments} = require('../db/dbInteraction');
const authenticateRouter = express.Router();


// register a new user route
authenticateRouter.post('/register', userValidator, async (req, res) => {
  const { email, password } = req.body;
  try {
    // check if user already exists
    const existingUsers = await findDocuments('users', { email });
    if (existingUsers.length > 0) {
      return res.status(409).json({ message: `User with email ${email} already exists` });
    }

    // hash password and create user object
    const hashedPassword = await bcrypt.hash(password, 8);
    const newUser = { email, password: hashedPassword };

    await insertSingleDocument('users', newUser);
    return res.status(201).json({ message: `New user with email ${email} was successfully registered` });
  } catch (err) {
    console.error('Error during user registration:', err);
    return res.status(500).json({ error: 'An internal error occurred, please try again later' });
  }
});


module.exports = authenticateRouter;