const Discord = require("discord.js");
const client = new Discord.Client();
const disbut = require("discord-buttons");
const token = require("./token.json");
const snooze = (milliseconds) =>
  new Promise((resolve) => setTimeout(resolve, milliseconds));
const { AutosaveJSON } = require("./autosaver");
const { CHandle } = require("./command-handler");
disbut(client);

const data = AutosaveJSON(__dirname + "/data.json", { users: {} });

const weedmenu = {};

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

const weedembedrenderer = (author, weed) => {
  let growingnum = 0;
  for (const grow of weed.data.growing) {
    growingnum += grow.amount;
  }
  return new Discord.MessageEmbed()
    .setAuthor(author.tag, author.avatarURL())
    .setTitle("WEED FARM")
    .addFields([
      { name: "SEEDS", value: `${weed.data.seeds} / ${weed.limits.seeds}` },
      { name: "GROWING", value: `${growingnum} / ${weed.limits.growing}` },
      {
        name: "STORAGE",
        value: `${weed.data.storage} / ${weed.limits.storage}`,
      },
    ])
    .setThumbnail(
      "https://github.com/Ugric/lamar-bot-js/blob/main/images/weed.png?raw=true&nocache=1"
    )
    .setImage(
      "https://github.com/Ugric/lamar-bot-js/blob/main/images/lamar%20weed%20farm.jpg?raw=true"
    )
    .setDescription(`buy and sell weed with the controls at the bottom!`)
    .setColor("#047000");
};

client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}!`);
});
client.on("clickButton", async (button) => {
  if (button.clicker.user) {
    button.reply.defer().catch(console.error);
    if (["wbuymax", "wplant", "wpick", "wsellall"].includes(button.id)) {
      const account = data.current.users[button.clicker.user.id];
      const business = account.businesses.weed;
      let growingnum = 0;
      for (const grow of business.data.growing) {
        growingnum += grow.amount;
      }
      if (button.id == "wbuymax") {
        const tobuy = business.limits.seeds - business.data.seeds;
        if (tobuy > 0 && account.money > 0) {
          if (account.money - tobuy < 0) {
            business.data.seeds += account.money;
            account.money = 0;
          } else {
            business.data.seeds += tobuy;
            account.money -= tobuy;
          }
          weedmenu[button.clicker.user.id].edit(
            weedembedrenderer(button.clicker.user, business)
          );
        }
      } else if (button.id == "wplant") {
        if (business.data.seeds > 0 && growingnum < business.limits.growing) {
          const maxToPlant = business.limits.growing - growingnum;
          const toPlant =
            maxToPlant < business.data.seeds ? maxToPlant : business.data.seeds;

          business.data.seeds -= toPlant;
          business.data.growing.push({
            amount: toPlant,
            time: new Date().getTime(),
          });
          weedmenu[button.clicker.user.id].edit(
            weedembedrenderer(button.clicker.user, business)
          );
        }
      } else if (button.id == "wpick") {
      } else {
      }
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
          weed: async () => {
            if (weedmenu[message.author.id]) {
              weedmenu[message.author.id].delete().catch(() => {});
            }
            weedmenu[message.author.id] = await message.reply(
              weedembedrenderer(
                message.author,
                data.current.users[message.author.id].businesses.weed
              ),
              new disbut.MessageActionRow()
                .addComponent(
                  new disbut.MessageButton()
                    .setStyle("blurple")
                    .setID("wbuymax")
                    .setLabel("💵 buy max")
                )
                .addComponent(
                  new disbut.MessageButton()
                    .setStyle("blurple")
                    .setID("wplant")
                    .setLabel("🌱 plant")
                )
                .addComponent(
                  new disbut.MessageButton()
                    .setStyle("blurple")
                    .setID("wpick")
                    .setLabel("✂ pick")
                )
                .addComponent(
                  new disbut.MessageButton()
                    .setStyle("blurple")
                    .setID("wsellall")
                    .setLabel("💸 sell all")
                )
            );
          },
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
