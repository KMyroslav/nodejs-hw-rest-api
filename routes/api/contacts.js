const createError = require("http-errors");
const express = require("express");
const router = express.Router();
const { Contact, joiSchema } = require("../../models/contacts");

router.get("/", async (req, res, next) => {
  try {
    const contacts = await Contact.find();
    res.json(contacts);
  } catch (error) {
    next(error);
  }
});

router.get("/:contactId", async (req, res, next) => {
  const { contactId } = req.params;

  try {
    const contact = await Contact.findById(contactId);

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

router.post("/", async (req, res, next) => {
  const { error } = joiSchema.validate(req.body);

  if (error) {
    return next(createError(400, error));
  }

  try {
    const newContact = await Contact.create(req.body);
    res.status(201).json(newContact);
  } catch (error) {
    if (error.message.includes("validation failed")) {
      error.status = 400;
    }
    next(error);
  }
});

router.delete("/:contactId", async (req, res, next) => {
  const { contactId } = req.params;
  try {
    const removedContact = await Contact.findByIdAndRemove(contactId);
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

router.patch("/:contactId", async (req, res, next) => {
  const contactBody = req.body;
  const { contactId } = req.params;
  const { error } = joiSchema.validate(contactBody);

  if (error) {
    return next(createError(400, error));
  }

  try {
    const updatedContact = await Contact.findByIdAndUpdate(
      contactId,
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

module.exports = router;
