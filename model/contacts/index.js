const fs = require("fs/promises");
const getContactsPath = require("./getContactsPath");
const updateContacts = require("./updateContacs");

const contactsPath = getContactsPath();

const listContacts = async () => {
  const contacts = await fs.readFile(contactsPath).then(JSON.parse);

  return contacts;
};

const getContactById = async (contactId) => {
  const contacts = await listContacts();
  const result = contacts.find(({ id }) => id === contactId);

  if (!result) {
    console.error(`Couldnt find contact with id: ${contactId}`);
    return null;
  }
  return result;
};

const removeContact = async (contactId) => {
  const contacts = await listContacts();
  const idx = contacts.findIndex((el) => el.id === contactId);

  if (idx === -1) {
    console.error(`Couldnt find contact with id: ${contactId}`);
    return null;
  }

  const removedContact = contacts.splice(idx, 1)[0];

  updateContacts(contactsPath, contacts);

  return removedContact;
};

const addContact = async (newContact) => {
  const contacts = await listContacts();
  const updatedContacts = [...contacts, newContact];

  updateContacts(contactsPath, updatedContacts);

  return newContact;
};

const updateContact = async (contactId, body) => {
  const contacts = await listContacts();
  const idx = contacts.findIndex((el) => el.id === contactId);

  if (idx === -1) {
    console.error(`Couldnt find contact with id: ${contactId}`);
    return null;
  }

  contacts[idx] = { ...contacts[idx], ...body };

  updateContacts(contactsPath, contacts);

  return contacts[idx];
};

module.exports = {
  listContacts,
  getContactById,
  removeContact,
  addContact,
  updateContact,
};
