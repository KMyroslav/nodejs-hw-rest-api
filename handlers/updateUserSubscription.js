const { User } = require("../models/users");

async function updateUserSubscription(contact, body) {
  await User.findOneAndUpdate(contact, body);
  const result = await User.findOne(contact);
  return result;
}

module.exports = updateUserSubscription;
