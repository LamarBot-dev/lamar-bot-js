const Discord = require('discord.js');
const client = new Discord.Client();
const disbut = require('discord-buttons');
const token = require("./token.json")
const snooze = milliseconds => new Promise((resolve) => setTimeout(resolve, milliseconds))
const { AutosaveJSON } = require("./autosaver")
const { CHandle } = require("./command-handler")
disbut(client);


const data = AutosaveJSON(__dirname + "/data.json", { users: {} })

const prefix = "l"

const helpmenu = () => new Discord.MessageEmbed().setThumbnail("https://github.com/Ugric/lamar-bot-js/blob/main/images/gta5-logo.png?raw=true").setTitle("HELP MENU")


client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', async message => {
    try {
        CHandle({
            message, prefix, notfound: (args) => {
                message.reply(helpmenu())
            }
        })
    } catch { }
});

client.login(token);