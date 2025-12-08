
const jwtLib = require('jsonwebtoken');
require('dotenv').config();

const jwtSecret = process.env.JWTSECRET;


async function createToken(data) {
  return new Promise((resolve, reject) => {
    jwtLib.sign(
      data,
      jwtSecret,
      { expiresIn: '2h' },
      (error, signedToken) => {
        if (error) {
          return reject(error);
        }
        resolve(signedToken);
      }
    );
  });
}


async function authenticateToken(request, response, next) {
  const authHeader = request.headers['authorization'];

  if (!authHeader) {
    return response.status(401).send({ message: 'No authorization token provided' });
  }

  try {
    const userPayload = await new Promise((resolve, reject) => {
      jwtLib.verify(authHeader, jwtSecret, (error, decoded) => {
        if (error) {
          return reject(error);
        }
        resolve(decoded);
      });
    });
    request.user = userPayload;
    next();
  } catch (error) {
    console.error('Token authentication failed:', error);
    return response.status(401).send({ message: 'Token is invalid or expired.' });
  }
}

module.exports = {
  createToken,
  authenticateToken
};
