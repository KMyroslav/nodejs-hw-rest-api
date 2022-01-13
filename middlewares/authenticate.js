const jwt = require("jsonwebtoken");
const createError = require("http-errors");

const { User } = require("../models/users");

const { SECRET_KEY } = process.env;

const authenticate = async (req, res, next) => {
  try {
    const { authorization } = req.headers;
    if (!authorization) {
      return next(createError(401, "Not authorized"));
    }

    const [bearer, token] = authorization.split(" ");
    if (bearer !== "Bearer") {
      return next(createError(401, "Not authorized"));
    }

    jwt.verify(token, SECRET_KEY);
    const user = await User.findOne({ token });
    if (!user) {
      return next(createError(401, "Not authorized"));
    }
    req.user = user;

    next();
  } catch (error) {
    if (!error.status) {
      error.status = 401;
      error.message = "Not authorized";
    }
    next(error);
  }
};

module.exports = authenticate;
