const fs = require("fs").promises;

function updateContacts(path, data) {
  fs.writeFile(path, JSON.stringify(data, null, 2));
}

module.exports = updateContacts;
