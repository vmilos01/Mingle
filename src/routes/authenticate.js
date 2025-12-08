
const express = require('express');
const bcrypt = require('bcryptjs');
const {userValidator} = require('../schema/schema');
const { insertSingleDocument, findDocuments} = require('../db/dbInteraction');
const authenticateRouter = express.Router();
const {createToken} = require('../auth/auth');


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

authenticateRouter.post("/login", userValidator, async (req, res) => {
  const sendAuthError = () => res.status(401).json({ error: "Wrong authentication credentials" });
  const sendServerError = (msg, err) => {
    console.error(msg, err);
    return res.status(500).json({ error: msg });
  };

  try {
    const { email, password } = req.body;
    const user = (await findDocuments("users", { email }))[0];
    if (!user) return sendAuthError();

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return sendAuthError();

    const payload = { email: user.email, id: user.id };
    let token;
    try {
      token = await createToken(payload);
    } catch (err) {
      return sendServerError("Failed to generate authentication token.", err);
    }
    return res.status(200).json({ authToken: token });
  } catch (err) {
    return sendServerError("An internal error occurred, please try again later.", err);
  }
})


module.exports = authenticateRouter;