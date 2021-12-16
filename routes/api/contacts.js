const { v4 } = require("uuid");
const Joi = require("joi");
const createError = require("http-errors");
const express = require("express");
const router = express.Router();
const contactsOperations = require("../../model/contacts");

const joiSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  phone: Joi.required(),
});

router.get("/", async (req, res, next) => {
  try {
    const contacts = await contactsOperations.listContacts();
    res.json(contacts);
  } catch (error) {
    next(error);
  }
});

router.get("/:contactId", async (req, res, next) => {
  const { contactId } = req.params;

  try {
    const contact = await contactsOperations.getContactById(contactId);

    if (!contact) {
      next();
    }
    res.json(contact);
  } catch (error) {
    next(error);
  }
});

router.post("/", async (req, res, next) => {
  const { error } = joiSchema.validate(req.body);

  if (error) {
    return next(createError(400, error));
  }

  try {
    const newContact = await contactsOperations.addContact({
      id: v4(),
      ...req.body,
    });
    res.status(201).json(newContact);
  } catch (error) {
    next(error);
  }
});

router.delete("/:contactId", async (req, res, next) => {
  const { contactId } = req.params;
  try {
    const removedContact = await contactsOperations.removeContact(contactId);
    if (!removedContact) {
      return next();
    }
    res.json(`${removedContact?.name}'s contact is deleted`);
  } catch (error) {
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
    const updatedContact = await contactsOperations.updateContact(
      contactId,
      contactBody
    );

    if (!updatedContact) {
      return next();
    }
    res.json(updatedContact);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
