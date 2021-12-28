const { Contact } = require("../models/contacts");

async function updateStatusContact(contactId, body) {
  await Contact.findByIdAndUpdate(contactId, body);
  const result = await Contact.findById(contactId);
  return result;
}

module.exports = updateStatusContact;
