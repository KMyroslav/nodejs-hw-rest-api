const createError = require("http-errors");
const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const router = express.Router();
const { User, joiSignupSchema } = require("../../models/users");
const authenticate = require("../../middlewares/authenticate");

const { SECRET_KEY } = process.env;

router.post("/signup", async (req, res, next) => {
  const { email, password } = req.body;
  const { error } = joiSignupSchema.validate(req.body);

  if (error) {
    return next(createError(400, error));
  }

  try {
    const user = await User.findOne({ email });
    if (user) {
      return next(createError(409, "Email in use"));
    }

    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);
    const newUser = await User.create({
      email,
      password: hashPassword,
    });
    res.status(201).json({
      user: {
        email: newUser.email,
        subscription: "starter",
      },
    });
  } catch (error) {
    next(error);
  }
});

router.post("/login", async (req, res, next) => {
  const { error } = joiSignupSchema.validate(req.body);

  if (error) {
    return next(createError(400, error));
  }

  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return next(createError(401, "Email or password is wrong"));
    }

    const passwordCompare = await bcrypt.compare(password, user.password);
    if (!passwordCompare) {
      return next(createError(401, "Email or password is wrong"));
    }

    const { _id } = user;
    const payload = {
      id: _id,
    };
    const token = jwt.sign(payload, SECRET_KEY, { expiresIn: "2h" });
    await User.findByIdAndUpdate(_id, { token });

    res.json({
      token,
      user: {
        email,
        subscription: "starter",
      },
    });
  } catch (error) {
    next(error);
  }
});

router.get("/logout", authenticate, async (req, res, next) => {
  const { _id } = req.user;

  try {
    await User.findOneAndUpdate(_id, { token: null });
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

module.exports = router;
