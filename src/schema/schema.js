
const Joi = require('joi');

// user registration schema
const userSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string()
    .pattern(/^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*\W)(?!.* ).{8,}$/)   // password must contain one digit, one lowercase, one uppercase, one special character, no space, and at least 8 characters
    .required(),
}).required();

// new post creation schema
const newPostSchema = Joi.object({
  title: Joi.string().required(),
  topic: Joi.array().items(Joi.string().valid('Politics', 'Health', 'Sport', 'Tech')).min(1).max(4).required(),
  message: Joi.string().required(),
  owner: Joi.string().email().required(),
}).required();

// post interaction schema
const postInteractionSchema = Joi.object({
  title: Joi.string().required(),
  like: Joi.bool(),
  dislike: Joi.bool(),
  comment: Joi.string(),
})
  .nand('like', 'dislike') // only one of like or dislike can be present
  .min(2) // minimum two fields to ensure at least one interaction is specified
  .required();

// get post query schema
const getPostSchema = Joi.object({
  topic: Joi.array().items(Joi.string().valid('Politics', 'Health', 'Sport', 'Tech')),
  status: Joi.string().valid('Valid', 'Expired', 'all'),
  highestInterest: Joi.bool(),
}).required();


// helper to send Joi validation errors
function sendValidationError(res, error) {
  return res.status(400).json({ error: error.details });
}

function userValidator(req, res, next) {
  const { error } = userSchema.validate(req.body);
  if (error) return sendValidationError(res, error);
  next();
}

function postCreationValidator(req, res, next) {
  const { error } = newPostSchema.validate(req.body);
  if (error) return sendValidationError(res, error);
  next();
}

function postQueryValidator(req, res, next) {
  // ensure topic is always an array if present
  if (req.query.topic && !Array.isArray(req.query.topic)) {
    req.query.topic = [req.query.topic];
  }
  const { error } = getPostSchema.validate(req.query);
  if (error) return sendValidationError(res, error);
  next();
}

function postInteractionValidator(req, res, next) {
  const { error } = postInteractionSchema.validate(req.body);
  if (error) return sendValidationError(res, error);
  next();
}

module.exports = {
  userValidator,
  postCreationValidator,
  postInteractionValidator,
  postQueryValidator,
};

