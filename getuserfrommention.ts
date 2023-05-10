const { client } = require("./discordclient");

function getuserfrommention(mention: string) {
  console.log(mention)
  const matches = mention.match(/^<@!?(\d+)>$/);
  if (!matches) return;
  const id = matches[1];
  return id;
}

export { getuserfrommention };
