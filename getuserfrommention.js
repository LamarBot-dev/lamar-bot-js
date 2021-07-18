const { client } = require("./discordclient");

function getuserfrommention(mention) {
  const matches = mention.match(/^<@!?(\d+)>$/);
  if (!matches) return;
  const id = matches[1];
  return id;
}

module.exports = { getuserfrommention };
