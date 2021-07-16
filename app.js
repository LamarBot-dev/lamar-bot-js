const { Discord, disbut, client } = require("./discordclient");
const token = require("./token.json");
const { buttoncontrols, weedstart } = require("./weed");
const snooze = (milliseconds) =>
  new Promise((resolve) => setTimeout(resolve, milliseconds));
const { data } = require("./data");
const { CHandle } = require("./command-handler");
disbut(client);

const inintro = [];

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
    if (["wbuymax", "wplant", "wpick", "wsellall"].includes(button.id)) {
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
          create: async () => {
            if (inintro.includes(message.author.id)) return;
            inintro.push(message.author.id);
            await message.author.send(
              new Discord.MessageEmbed()
                .setAuthor(message.author.tag, message.author.avatarURL())
                .setThumbnail(
                  "https://github.com/Ugric/lamar-bot-js/blob/main/images/infomation%20icon.png?raw=true"
                )
                .setImage(
                  "https://github.com/Ugric/lamar-bot-js/blob/main/images/tv%20micheal.gif?raw=true"
                )
                .setDescription(
                  `Hello ${message.author.username}, and welcome to the Lamar Bot experience!`
                )
            );
            await snooze(5000);
            await message.author.send(
              new Discord.MessageEmbed()
                .setTitle(`${message.author.username}'s IFruit`)
                .setThumbnail(
                  "https://github.com/Ugric/lamar-bot-js/blob/main/images/ifruit.png?raw=true"
                )
            );
            let typingmessage = await message.author.send(
              new Discord.MessageEmbed().setDescription(`UNKNOWN is typing...`)
            );
            await snooze(5000);
            await typingmessage.edit(
              new Discord.MessageEmbed()
                .setAuthor(
                  "UNKNOWN",
                  "https://github.com/Ugric/lamar-bot-js/blob/main/images/unknown%20contact.PNG?raw=true"
                )
                .setDescription(`What up, its ya boy LD.`)
            );
            await snooze(2500);
            typingmessage = await message.author.send(
              new Discord.MessageEmbed().setDescription(`UNKNOWN is typing...`)
            );
            await snooze(5000);
            await typingmessage.edit(
              new Discord.MessageEmbed().setDescription(
                `I heard you were trying to get into the crime business.`
              )
            );
            await snooze(2500);
            typingmessage = await message.author.send(
              new Discord.MessageEmbed().setDescription(`you are typing...`)
            );
            await snooze(5000);
            await typingmessage.edit(
              new Discord.MessageEmbed()
                .setAuthor(message.author.tag, message.author.avatarURL())
                .setDescription(`Yeah thats me.`)
            );
            await snooze(2500);
            typingmessage = await message.author.send(
              new Discord.MessageEmbed().setDescription(`UNKNOWN is typing...`)
            );
            await snooze(5000);
            await typingmessage.edit(
              new Discord.MessageEmbed()
                .setAuthor(
                  "UNKNOWN",
                  "https://github.com/Ugric/lamar-bot-js/blob/main/images/unknown%20contact.PNG?raw=true"
                )
                .setDescription(
                  `Cool. Well if you need anything, holla at me homie.`
                )
            );
            await snooze(3000);
            await message.author.send(
              new Discord.MessageEmbed()
                .setTitle("Lamar")
                .setDescription("New Contact Added!")
                .setThumbnail(
                  "https://github.com/Ugric/lamar-bot-js/blob/main/images/lamar%20profile.PNG?raw=true"
                )
            );
            await snooze(5000);
            await message.author.send(
              new Discord.MessageEmbed()
                .setAuthor(message.author.tag, message.author.avatarURL())
                .setThumbnail(
                  "https://github.com/Ugric/lamar-bot-js/blob/main/images/infomation%20icon.png?raw=true"
                )
                .setImage(
                  "https://github.com/Ugric/lamar-bot-js/blob/main/images/rob.gif?raw=true"
                )
                .setDescription(`Do robberies!`)
            );
            await snooze(5000);
            await message.author.send(
              new Discord.MessageEmbed()
                .setAuthor(message.author.tag, message.author.avatarURL())
                .setThumbnail(
                  "https://github.com/Ugric/lamar-bot-js/blob/main/images/infomation%20icon.png?raw=true"
                )
                .setImage(
                  "https://github.com/Ugric/lamar-bot-js/blob/main/images/lamar%20weed%20farm.jpg?raw=true"
                )
                .setDescription(
                  `Grow weed and other drugs to sell and become extremely rich!`
                )
            );
            await snooze(5000);
            await message.author.send(
              new Discord.MessageEmbed()
                .setAuthor(message.author.tag, message.author.avatarURL())
                .setThumbnail(
                  "https://github.com/Ugric/lamar-bot-js/blob/main/images/infomation%20icon.png?raw=true"
                )
                .setImage(
                  "https://github.com/Ugric/lamar-bot-js/blob/main/images/life%20invader.jpg?raw=true"
                )
                .setDescription(
                  `Follow people on Life Invader and tell people about your boring existance!`
                )
            );
            await snooze(5000);
            await message.author.send(
              new Discord.MessageEmbed()
                .setAuthor(message.author.tag, message.author.avatarURL())
                .setThumbnail(
                  "https://github.com/Ugric/lamar-bot-js/blob/main/images/infomation%20icon.png?raw=true"
                )
                .setImage(
                  "https://github.com/Ugric/lamar-bot-js/blob/main/images/your%20gonna%20be%20shot%20amigo.gif?raw=true"
                )
                .setDescription(`Have fun!`)
            );
            data.current.users[message.author.id] = {
              money: 10,
              businesses: {
                weed: {
                  data: { seeds: 0, growing: [], storage: 0 },
                  limits: { seeds: 20, growing: 10, storage: 30 },
                },
              },
              lifeinvader: { followers: [] },
            };
            inintro.splice(inintro.indexOf(message.author.id), 1);
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
