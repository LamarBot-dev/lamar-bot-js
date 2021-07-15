const Discord = require('discord.js');
const client = new Discord.Client();
const disbut = require('discord-buttons');
const token = require("./token.json")
const snooze = milliseconds => new Promise((resolve) => setTimeout(resolve, milliseconds))
const { AutosaveJSON } = require("./autosaver")
const { CHandle } = require("./command-handler")
disbut(client);


const data = AutosaveJSON(__dirname + "/data.json", { users: {} })

const prefix = "!l"

const commandprefixadder = (command) => `${prefix} ${command}`

const helpmenu = () => new Discord.MessageEmbed().setThumbnail("https://raw.githubusercontent.com/Ugric/lamar-bot-js/main/images/tv%20micheal.gif").setTitle("HELP MENU")
    .setDescription("commands:").addFields([{ name: commandprefixadder("weed"), value: "start growing your weed business!" }])


client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', async message => {
    try {
        CHandle({
            message, prefix,
            commands: {
                weed: () => {
                    message.reply("hi")
                },
                help: () => {

                    message.reply(helpmenu())
                }
            }
            , notfound: (args) => {
                message.reply(new Discord.MessageEmbed().setTitle("command not found!").setThumbnail("").setDescription(`do \`${commandprefixadder("help")}\` to get a list of all commands!`))
            }
        })
    } catch { }
});

client.login(token);