const path = require("path");

function getContactsPath() {
  const contactsPath = path.resolve("model/contacts/contacts.json");
  return contactsPath;
}

module.exports = getContactsPath;
