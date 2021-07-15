const Discord = require('discord.js');
const client = new Discord.Client();
const disbut = require('discord-buttons');
const token = require("./token.json")
const snooze = milliseconds => new Promise((resolve) => setTimeout(resolve, milliseconds))
const { AutosaveJSON } = require("./autosaver")
const { CHandle } = require("./command-handler")
disbut(client);


const data = AutosaveJSON(__dirname + "/data.json", { users: {} })

const weedmenu = {}

const inintro = []

const prefix = "!l"

const commandprefixadder = (command) => `${prefix} ${command}`

const helpmenu = (message) => new Discord.MessageEmbed().setAuthor(message.author.tag, message.author.avatarURL()).setThumbnail("https://raw.githubusercontent.com/Ugric/lamar-bot-js/main/images/tv%20micheal.gif").setTitle("HELP MENU")
    .setDescription("commands:").addFields([{ name: commandprefixadder("weed"), value: "start growing your weed business!" }])

const weedembedrenderer = (message, weed) => {
    let growingnum = 0
    for (grow in growing) {
        growingnum += (growing[grow].amount)
    }
    return new Discord.MessageEmbed()
        .setAuthor(
            message
                .author
                .tag,
            message
                .author
                .avatarURL())
        .setTitle("WEED FARM")
        .addFields([{ name: "SEEDS", value: `${weed.data.seeds} / ${weed.limits.seeds}` }, { name: "GROWING", value: `${growingnum} / ${weed.limits.growing}` }, { name: "STORAGE", value: `${weed.data.storage} / ${weed.limits.storage}` }])
        .setThumbnail("https://github.com/Ugric/lamar-bot-js/blob/main/images/weed.png?raw=true&nocache=1")
        .setImage("https://github.com/Ugric/lamar-bot-js/blob/main/images/lamar%20weed%20farm.jpg?raw=true")
        .setDescription(`buy and sell weed with the controls at the bottom!`)
        .setColor("#047000")
}


client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});
client.on('clickButton', async (button) => { console.log(button) })
client.on('message', async message => {
    try {
        if (data.current.users[message.author.id]) {
            CHandle({
                message, prefix,
                commands: {
                    weed: () => {
                        if (weedmenu[message.author.id]) {
                            weedmenu[message.author.id].delete().catch(() => { })
                        }
                        weedmenu[message.author.id] = message.reply(weedembedrenderer(message, data.current.users[message.author.id].businesses.weed),
                            new disbut.MessageActionRow()
                                .addComponent(
                                    new disbut.MessageButton()
                                        .setStyle("blurple")
                                        .setID("buymax")
                                        .setLabel("💵 buy max")
                                ).addComponent(
                                    new disbut.MessageButton()
                                        .setStyle("blurple")
                                        .setID("plant")
                                        .setLabel("🌱 plant")
                                ).addComponent(
                                    new disbut.MessageButton()
                                        .setStyle("blurple")
                                        .setID("pick")
                                        .setLabel("✂ pick")
                                ).addComponent(new disbut.MessageButton()
                                    .setStyle("blurple")
                                    .setID("sellall")
                                    .setLabel("💸 sell all")
                                )
                        )
                    },
                    help: () => {
                        message.reply(
                            helpmenu(message)
                        )
                    }
                }
                , notfound: () => {
                    message.reply(
                        new Discord.MessageEmbed()
                            .setAuthor(
                                message
                                    .author
                                    .tag
                                , message
                                    .author
                                    .avatarURL()
                            )
                            .setTitle("command not found!")
                            .setThumbnail("https://github.com/Ugric/lamar-bot-js/blob/main/images/infomation%20icon.png?raw=true")
                            .setImage("https://github.com/Ugric/lamar-bot-js/blob/main/images/no%20no%20no.gif?raw=true")
                            .setDescription(`Do \`${commandprefixadder("help")}\` to get a list of all commands!`)
                    )
                }
            })
        } else {
            CHandle({
                message, prefix,
                commands: {
                    create: async () => {
                        if (inintro.includes(message.author.id)) return
                        inintro.push(message.author.id)
                        await message.author.send(new Discord.MessageEmbed()
                            .setAuthor(
                                message
                                    .author
                                    .tag
                                , message
                                    .author
                                    .avatarURL()
                            )
                            .setThumbnail("https://github.com/Ugric/lamar-bot-js/blob/main/images/infomation%20icon.png?raw=true")
                            .setImage("https://github.com/Ugric/lamar-bot-js/blob/main/images/tv%20micheal.gif?raw=true")
                            .setDescription(`Hello ${message.author.username}, and welcome to the Lamar Bot experience!`)
                        )
                        await snooze(5000)
                        await message.author.send(new Discord.MessageEmbed()
                            .setTitle(`${message.author.username}'s phone`)
                            .setThumbnail("https://github.com/Ugric/lamar-bot-js/blob/main/images/ifruit.png?raw=true")
                        )
                        let typingmessage = await message.author.send(new Discord.MessageEmbed()
                            .setDescription(`UNKNOWN is typing...`)
                        )
                        await snooze(5000)
                        await typingmessage.edit(new Discord.MessageEmbed()
                            .setAuthor(
                                "UNKNOWN"
                                , "https://github.com/Ugric/lamar-bot-js/blob/main/images/unknown%20contact.PNG?raw=true"
                            )
                            .setDescription(`What up, its ya boy LD.`)
                        )
                        await snooze(2500)
                        typingmessage = await message.author.send(new Discord.MessageEmbed()
                            .setDescription(`UNKNOWN is typing...`)
                        )
                        await snooze(5000)
                        await typingmessage.edit(new Discord.MessageEmbed()
                            .setDescription(`I heard you were trying to get into the crime business.`)
                        )
                        await snooze(2500)
                        typingmessage = await message.author.send(new Discord.MessageEmbed()
                            .setDescription(`you are typing...`)
                        )
                        await snooze(5000)
                        await typingmessage.edit(new Discord.MessageEmbed()
                            .setAuthor(
                                message
                                    .author
                                    .tag
                                , message
                                    .author
                                    .avatarURL()
                            )
                            .setDescription(`Yeah thats me.`)
                        )
                        await snooze(2500)
                        typingmessage = await message.author.send(new Discord.MessageEmbed()
                            .setDescription(`UNKNOWN is typing...`)
                        )
                        await snooze(5000)
                        await typingmessage.edit(new Discord.MessageEmbed()
                            .setAuthor(
                                "UNKNOWN"
                                , "https://github.com/Ugric/lamar-bot-js/blob/main/images/unknown%20contact.PNG?raw=true"
                            )
                            .setDescription(`Cool. Well if you need anything, holla at me homie.`)
                        )
                        await snooze(3000)
                        await message.author.send(new Discord.MessageEmbed()
                            .setTitle("Lamar")
                            .setDescription("New Contact Added!")
                            .setThumbnail("https://github.com/Ugric/lamar-bot-js/blob/main/images/lamar%20profile.PNG?raw=true")
                        )
                        await snooze(5000)
                        await message.author.send(new Discord.MessageEmbed()
                            .setAuthor(
                                message
                                    .author
                                    .tag
                                , message
                                    .author
                                    .avatarURL()
                            )
                            .setThumbnail("https://github.com/Ugric/lamar-bot-js/blob/main/images/infomation%20icon.png?raw=true")
                            .setImage("https://github.com/Ugric/lamar-bot-js/blob/main/images/rob.gif?raw=true")
                            .setDescription(`Do robberies!`)
                        )
                        await snooze(5000)
                        await message.author.send(new Discord.MessageEmbed()
                            .setAuthor(
                                message
                                    .author
                                    .tag
                                , message
                                    .author
                                    .avatarURL()
                            )
                            .setThumbnail("https://github.com/Ugric/lamar-bot-js/blob/main/images/infomation%20icon.png?raw=true")
                            .setImage("https://github.com/Ugric/lamar-bot-js/blob/main/images/lamar%20weed%20farm.jpg?raw=true")
                            .setDescription(`Grow weed and other drugs to sell and become extremely rich!`)
                        )
                        await snooze(5000)
                        await message.author.send(new Discord.MessageEmbed()
                            .setAuthor(
                                message
                                    .author
                                    .tag
                                , message
                                    .author
                                    .avatarURL()
                            )
                            .setThumbnail("https://github.com/Ugric/lamar-bot-js/blob/main/images/infomation%20icon.png?raw=true")
                            .setImage("https://github.com/Ugric/lamar-bot-js/blob/main/images/life%20invader.jpg?raw=true")
                            .setDescription(`Follow people on Life Invader and tell people about your boring existance!`)
                        )
                        await snooze(5000)
                        await message.author.send(new Discord.MessageEmbed()
                            .setAuthor(
                                message
                                    .author
                                    .tag
                                , message
                                    .author
                                    .avatarURL()
                            )
                            .setThumbnail("https://github.com/Ugric/lamar-bot-js/blob/main/images/infomation%20icon.png?raw=true")
                            .setImage("https://github.com/Ugric/lamar-bot-js/blob/main/images/your%20gonna%20be%20shot%20amigo.gif?raw=true")
                            .setDescription(`Have fun!`)
                        )
                        data.current.users[message.author.id] = {
                            money: 0,
                            businesses: { weed: { data: { seeds: 0, growing: [], storage: 0 }, limits: { seeds: 20, growing: 10, storage: 30 } } }, lifeinvader: { followers: [] }
                        }
                        inintro.splice(inintro.indexOf(message.author.id), 1)
                    }
                }
                , notfound: () => {
                    message.reply(
                        new Discord.MessageEmbed()
                            .setAuthor(
                                message
                                    .author
                                    .tag
                                , message
                                    .author
                                    .avatarURL()
                            )
                            .setTitle("command not found!")
                            .setThumbnail("https://github.com/Ugric/lamar-bot-js/blob/main/images/infomation%20icon.png?raw=true")
                            .setImage("https://github.com/Ugric/lamar-bot-js/blob/main/images/dancing%20lamar.gif?raw=true")
                            .setDescription(`To create your profile, do \`${commandprefixadder("create")}\``)
                    )
                }
            })
        }
    } catch { }
});

client.login(token);