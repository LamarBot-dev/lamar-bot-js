const { AutosaveJSON } = require("./autosaver");

module.exports = {
  data: AutosaveJSON(__dirname + "/data.json", { users: {} }),
};
