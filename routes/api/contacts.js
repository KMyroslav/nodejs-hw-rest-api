const createError = require("http-errors");
const express = require("express");
const router = express.Router();
const { Contact, joiSchema } = require("../../models/contacts");
const { authenticate } = require("../../middlewares");
const updateStatusContact = require("../../handlers/updateStatusContact");

router.get("/", authenticate, async (req, res, next) => {
  const { _id } = req.user;
  const { page = 1, limit = 10, favorite = false } = req.query;
  const skip = (page - 1) * limit;

  try {
    const contacts = await Contact.find({ owner: _id }, "-__v", {
      skip,
      limit: +limit,
    });
    if (favorite) {
      const favoriteContacts = contacts.filter(
        (contact) => `${contact.favorite}` === favorite
      );
      return res.json(favoriteContacts);
    }
    res.json(contacts);
  } catch (error) {
    next(error);
  }
});

router.get("/:contactId", authenticate, async (req, res, next) => {
  const { contactId } = req.params;
  const { _id } = req.user;

  try {
    const contact = await Contact.findOne({ contactId, owner: _id });
    if (!contact) {
      next();
    }

    res.json(contact);
  } catch (error) {
    if (error.message.includes("Cast to ObjectId failed")) {
      error.status = 404;
    }
    next(error);
  }
});

router.post("/", authenticate, async (req, res, next) => {
  const { error } = joiSchema.validate(req.body);
  if (error) {
    return next(createError(400, error));
  }

  const { _id } = req.user;

  try {
    const newContact = await Contact.create({ ...req.body, owner: _id });
    res.status(201).json(newContact);
  } catch (error) {
    if (error.message.includes("validation failed")) {
      error.status = 400;
    }
    next(error);
  }
});

router.delete("/:contactId", authenticate, async (req, res, next) => {
  const { contactId } = req.params;
  const { _id } = req.user;

  try {
    const removedContact = await Contact.findOneAndDelete({
      contactId,
      owner: _id,
    });
    if (!removedContact) {
      return next();
    }
    res.json(`${removedContact?.name}'s contact is deleted`);
  } catch (error) {
    if (error.message.includes("Cast to ObjectId failed")) {
      error.status = 404;
    }
    next(error);
  }
});

router.patch("/:contactId", authenticate, async (req, res, next) => {
  const contactBody = req.body;
  const { contactId } = req.params;
  const { _id } = req.user;

  const { error } = joiSchema.validate(contactBody);
  if (error) {
    return next(createError(400, error));
  }

  try {
    const updatedContact = await Contact.findOneAndUpdate(
      {
        contactId,
        owner: _id,
      },
      contactBody
    );

    if (!updatedContact) {
      return next();
    }
    res.json(updatedContact);
  } catch (error) {
    if (error.message.includes("Cast to ObjectId failed")) {
      error.status = 404;
    }
    next(error);
  }
});

router.patch("/:contactId/favorite", authenticate, async (req, res, next) => {
  const favorite = req.body;
  const { contactId } = req.params;
  const { _id } = req.user;

  const { error } = joiSchema.validate(req.body);
  if (error) {
    return next(createError(400, error));
  }

  if (!favorite) {
    next(createError(400, "missing field favorite"));
  }

  try {
    const result = await updateStatusContact(
      { contactId, owner: _id },
      favorite
    );
    if (!result) {
      return next();
    }

    res.json(result);
  } catch (error) {
    if (error.message.includes("Cast to ObjectId failed")) {
      error.status = 404;
    }
    next(error);
  }
});

module.exports = router;
