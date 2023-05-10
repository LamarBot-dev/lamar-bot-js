import { client, Discord } from "./discordclient";
import token from "./token.json";
import { CHandle } from "./command-handler";
import { twaat, followplayer } from "./lifeinvader";
import data from "./data";

// custom games
import { buttoncontrols, weedButtonIDs, weedstart } from "./weed";
import { intro } from "./intromenu";

const prefix = "!l";

const commandprefixadder = (command: string) => `${prefix} ${command}`;

const helpmenu = (
    message: Discord.Message,
    title: string | undefined,
    commands: Discord.RestOrArray<Discord.APIEmbedField>
) =>
    new Discord.EmbedBuilder()
        .setAuthor({
            name: message.author.tag,
            iconURL: message.author.avatarURL() || undefined,
        })
        .setThumbnail(
            "https://github.com/Ugric/lamar-bot-js/blob/main/images/infomation%20icon.png?raw=true"
        )
        .setTitle(`HELP MENU${title ? ": " + title : ""}`)
        .setDescription("commands:")
        .addFields(...commands);
client.on("ready", () => {
    console.log(`Logged in as ${client.user?.tag}!`);
});
client.on("collect", async (button: Discord.CollectedInteraction) => {
    console.log(button)
    if (button.type !== Discord.InteractionType.MessageComponent) return;

    if (button.member?.user) {
        button.deferReply().catch(console.error);
        if (weedButtonIDs.includes(button.customId)) {
            buttoncontrols(data, button);
        } else {
            button
                .reply({
                    embeds: [
                        new Discord.EmbedBuilder()
                            .setAuthor({
                                name: button.user.tag,
                                iconURL: button.user.avatarURL() || undefined,
                            })
                            .setTitle("unknown button!")
                            .setThumbnail(
                                "https://github.com/Ugric/lamar-bot-js/blob/main/images/infomation%20icon.png?raw=true"
                            )
                            .setImage(
                                "https://github.com/Ugric/lamar-bot-js/blob/main/images/no%20no%20no.gif?raw=true"
                            ),
                    ],
                })
                .catch(console.error);
        }
    } else {
        button.deferReply().catch(console.error);
    }
});
client.on("messageCreate", async (message) => {
    if (data.current.users[message.author.id]) {
        CHandle({
            message,
            prefix,
            commands: {
                weed: weedstart,
                socials: {
                    follow: followplayer,
                    twaat,
                    help: () => {
                        message.reply({
                            embeds: [
                                helpmenu(message, "socials", [
                                    {
                                        name: commandprefixadder(
                                            "socials follow @someone"
                                        ),
                                        value: "follow @someone on life invader!",
                                    },
                                    {
                                        name: commandprefixadder(
                                            "socials twaat <put your message here>"
                                        ),
                                        value: "twaat to all of your followers!",
                                    },
                                    {
                                        name: commandprefixadder(
                                            "socials help"
                                        ),
                                        value: "get this help menu",
                                    },
                                ]),
                            ],
                        });
                    },
                },
                help: () => {
                    message.reply({
                        embeds: [
                            helpmenu(message, undefined, [
                                {
                                    name: commandprefixadder("weed"),
                                    value: "start growing your weed business!",
                                },
                                {
                                    name: commandprefixadder("socials help"),
                                    value: "use life invader!",
                                },
                                {
                                    name: commandprefixadder("help"),
                                    value: "get this help menu",
                                },
                            ]),
                        ],
                    });
                },
            },
            notfound: () => {
                message.reply({
                    embeds: [
                        new Discord.EmbedBuilder()
                            .setAuthor({
                                name: message.author.tag,
                                iconURL:
                                    message.author.avatarURL() || undefined,
                            })
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
                            ),
                    ],
                });
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
                message.reply({
                    embeds: [
                        new Discord.EmbedBuilder()
                            .setAuthor({
                                name: message.author.tag,
                                iconURL:
                                    message.author.avatarURL() || undefined,
                            })
                            .setTitle("command not found!")
                            .setThumbnail(
                                "https://github.com/Ugric/lamar-bot-js/blob/main/images/infomation%20icon.png?raw=true"
                            )
                            .setImage(
                                "https://github.com/Ugric/lamar-bot-js/blob/main/images/dancing%20lamar.gif?raw=true"
                            )
                            .setDescription(
                                `To create your profile, do \`${commandprefixadder(
                                    "create"
                                )}\``
                            ),
                    ],
                });
            },
        });
    }
});

client.login(token);
