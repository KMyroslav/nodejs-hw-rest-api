const { Contact } = require("../models/contacts");

async function updateStatusContact(contact, body) {
  await Contact.findOneAndUpdate(contact, body);
  const result = await Contact.findOne(contact);
  return result;
}

module.exports = updateStatusContact;
