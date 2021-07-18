const { Discord, disbut, client } = require("./discordclient");
const token = require("./token.json");
const { data } = require("./data");
const { CHandle } = require("./command-handler");
const { twaat, followplayer } = require("./lifeinvader");
disbut(client);

// custom games
const { buttoncontrols, weedstart } = require("./weed");
const { intro } = require("./intromenu");

const prefix = "!l";

const commandprefixadder = (command) => `${prefix} ${command}`;

const helpmenu = (message) =>
  new Discord.MessageEmbed()
    .setAuthor(message.author.tag, message.author.avatarURL())
    .setThumbnail(
      "https://raw.githubusercontent.com/Ugric/lamar-bot-js/main/images/tv%20micheal.gif"
    )
    .setTitle("HELP MENU")
    .setDescription("commands:")
    .addFields([
      {
        name: commandprefixadder("weed"),
        value: "start growing your weed business!",
      },
    ]);

client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}!`);
});
client.on("clickButton", async (button) => {
  if (button.clicker.user) {
    button.reply.defer().catch(console.error);
    if (
      [
        "wbuymax",
        "wplant",
        "wpick",
        "wsellall",
        "wuseeds",
        "wugrowing",
        "wustorage",
      ].includes(button.id)
    ) {
      buttoncontrols(data, button);
    } else {
      button.reply
        .send(
          new Discord.MessageEmbed()
            .setAuthor(button.clicker.user.tag, button.clicker.user.avatarURL())
            .setTitle("unknown button!")
            .setThumbnail(
              "https://github.com/Ugric/lamar-bot-js/blob/main/images/infomation%20icon.png?raw=true"
            )
            .setImage(
              "https://github.com/Ugric/lamar-bot-js/blob/main/images/no%20no%20no.gif?raw=true"
            )
        )
        .catch(console.error);
    }
  } else {
    button.reply.defer().catch(console.error);
  }
});
client.on("message", async (message) => {
  try {
    if (data.current.users[message.author.id]) {
      CHandle({
        message,
        prefix,
        commands: {
          weed: weedstart,
          socials: { follow: followplayer, twaat },
          help: () => {
            message.reply(helpmenu(message));
          },
        },
        notfound: () => {
          message.reply(
            new Discord.MessageEmbed()
              .setAuthor(message.author.tag, message.author.avatarURL())
              .setTitle("command not found!")
              .setThumbnail(
                "https://github.com/Ugric/lamar-bot-js/blob/main/images/infomation%20icon.png?raw=true"
              )
              .setImage(
                "https://github.com/Ugric/lamar-bot-js/blob/main/images/no%20no%20no.gif?raw=true"
              )
              .setDescription(
                `Do \`${commandprefixadder(
                  "help"
                )}\` to get a list of all commands!`
              )
          );
        },
      });
    } else {
      CHandle({
        message,
        prefix,
        commands: {
          create: intro,
        },
        notfound: () => {
          message.reply(
            new Discord.MessageEmbed()
              .setAuthor(message.author.tag, message.author.avatarURL())
              .setTitle("command not found!")
              .setThumbnail(
                "https://github.com/Ugric/lamar-bot-js/blob/main/images/infomation%20icon.png?raw=true"
              )
              .setImage(
                "https://github.com/Ugric/lamar-bot-js/blob/main/images/dancing%20lamar.gif?raw=true"
              )
              .setDescription(
                `To create your profile, do \`${commandprefixadder("create")}\``
              )
          );
        },
      });
    }
  } catch {}
});

client.login(token);
