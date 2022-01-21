const createError = require("http-errors");
const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const router = express.Router();
const fs = require("fs/promises");
const path = require("path");
const gravatar = require("gravatar/lib/gravatar");
const Jimp = require("jimp");
const {
  User,
  joiSignupSchema,
  joiSubscriptionSchema,
} = require("../../models/users");
const { authenticate, upload } = require("../../middlewares");
const updateUserSubscription = require("../../handlers/updateUserSubscription");

const { SECRET_KEY } = process.env;

const avatarsDir = path.join(__dirname, "../../", "public/avatars");

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
    const avatarURL = gravatar.url(email);
    const newUser = await User.create({
      email,
      password: hashPassword,
      avatarURL,
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

router.get("/current", authenticate, async (req, res, next) => {
  const { _id } = req.user;
  try {
    const user = await User.findById(_id, ["email", "subscription"]);
    res.json(user);
  } catch (error) {
    next(error);
  }
});

router.patch("/", authenticate, async (req, res, next) => {
  const { error } = joiSubscriptionSchema.validate(req.body);
  if (error) {
    return next(createError(400, error));
  }

  try {
    const { _id } = req.user;
    const user = await updateUserSubscription(_id, req.body);
    res.json(user);
  } catch (error) {
    next(error);
  }
});

router.patch(
  "/avatars",
  authenticate,
  upload.single("avatar"),
  async (req, res, next) => {
    const { path: tempUpload, filename } = req.file;
    const [extension] = filename.split(".").reverse();
    const newFileName = req.user.id + "." + extension;
    const fileUpload = path.join(avatarsDir, newFileName);

    try {
      const avatar = await Jimp.read(tempUpload);
      avatar.resize(256, 256).quality(75).write(fileUpload);

      const avatarURL = path.join("avatars", newFileName);
      await User.findByIdAndUpdate(req.user._id, { avatarURL });
      res.json({ avatarURL });
    } catch (error) {
      next(error);
    }

    fs.unlink(tempUpload);
  }
);

module.exports = router;
