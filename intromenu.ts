import { Discord } from "./discordclient";
import { snooze } from "./snooze";
import data from "./data";
import { commandFunctionType } from "./command-handler";

const inintro: string[] = [];
export const intro: commandFunctionType = async ({ message }) => {
    if (inintro.includes(message.author.id)) return;
    inintro.push(message.author.id);
    await message.author.send({
        embeds: [
            new Discord.EmbedBuilder()
                .setAuthor({
                    name: message.author.tag,
                    iconURL: message.author.avatarURL() || undefined,
                })
                .setThumbnail(
                    "https://github.com/Ugric/lamar-bot-js/blob/main/images/infomation%20icon.png?raw=true"
                )
                .setImage(
                    "https://github.com/Ugric/lamar-bot-js/blob/main/images/tv%20micheal.gif?raw=true"
                )
                .setDescription(
                    `Hello ${message.author.username}, and welcome to the Lamar Bot experience!`
                ),
        ],
    });
    await snooze(5000);
    await message.author.send({
        embeds: [
            new Discord.EmbedBuilder()
                .setTitle(`${message.author.username}'s IFruit`)
                .setThumbnail(
                    "https://github.com/Ugric/lamar-bot-js/blob/main/images/ifruit.png?raw=true"
                ),
        ],
    });
    let typingmessage = await message.author.send({
        embeds: [
            new Discord.EmbedBuilder().setDescription(`UNKNOWN is typing...`),
        ],
    });
    await snooze(5000);
    await typingmessage.edit({
        embeds: [
            new Discord.EmbedBuilder()
                .setAuthor(
                  {
                        name: "UNKNOWN",
                        iconURL:"https://github.com/Ugric/lamar-bot-js/blob/main/images/unknown%20contact.PNG?raw=true"

                  }
                )
                .setDescription(`What up, its ya boy LD.`),
        ],
    });
    await snooze(2500);
    typingmessage = await message.author.send({
        embeds: [
            new Discord.EmbedBuilder().setDescription(`UNKNOWN is typing...`),
        ],
    });
    await snooze(5000);
    await typingmessage.edit({
        embeds: [
            new Discord.EmbedBuilder().setDescription(
                `I heard you were trying to get into the crime business.`
            ),
        ],
    });
    await snooze(2500);
    typingmessage = await message.author.send({
        embeds: [
            new Discord.EmbedBuilder().setDescription(`you are typing...`),
        ],
    });
    await snooze(5000);
    await typingmessage.edit({
        embeds: [
            new Discord.EmbedBuilder()
                .setAuthor({
                    name: message.author.tag,
                    iconURL: message.author.avatarURL() || undefined,
                })
                .setDescription(`Yeah thats me.`),
        ],
    });
    await snooze(2500);
    typingmessage = await message.author.send({
        embeds: [
            new Discord.EmbedBuilder().setDescription(`UNKNOWN is typing...`),
        ],
    });
    await snooze(5000);
    await typingmessage.edit({
        embeds: [
            new Discord.EmbedBuilder()
                .setAuthor({
                    name: "UNKNOWN",
                    iconURL:
                        "https://github.com/Ugric/lamar-bot-js/blob/main/images/unknown%20contact.PNG?raw=true",
                })
                .setDescription(
                    `Cool. Well if you need anything, holla at me homie.`
                ),
        ],
    });
    await snooze(3000);
    await message.author.send({
        embeds: [
            new Discord.EmbedBuilder()
                .setTitle("Lamar")
                .setDescription("New Contact Added!")
                .setThumbnail(
                    "https://github.com/Ugric/lamar-bot-js/blob/main/images/lamar%20profile.PNG?raw=true"
                ),
        ],
    });
    await snooze(5000);
    await message.author.send({
        embeds: [
            new Discord.EmbedBuilder()
                .setAuthor({
                    name: message.author.tag,
                    iconURL: message.author.avatarURL() || undefined,
                })
                .setThumbnail(
                    "https://github.com/Ugric/lamar-bot-js/blob/main/images/infomation%20icon.png?raw=true"
                )
                .setImage(
                    "https://github.com/Ugric/lamar-bot-js/blob/main/images/rob.gif?raw=true"
                )
                .setDescription(`Do robberies!`),
        ],
    });
    await snooze(5000);
    await message.author.send({
        embeds: [
            new Discord.EmbedBuilder()
                .setAuthor({
                    name: message.author.tag,
                    iconURL: message.author.avatarURL() || undefined,
                })
                .setThumbnail(
                    "https://github.com/Ugric/lamar-bot-js/blob/main/images/infomation%20icon.png?raw=true"
                )
                .setImage(
                    "https://github.com/Ugric/lamar-bot-js/blob/main/images/lamar%20weed%20farm.jpg?raw=true"
                )
                .setDescription(
                    `Grow weed and other drugs to sell and become extremely rich!`
                ),
        ],
    });
    await snooze(5000);
    await message.author.send({
        embeds: [
            new Discord.EmbedBuilder()
                .setAuthor({
                    name: message.author.tag,
                    iconURL: message.author.avatarURL() || undefined,
                })
                .setThumbnail(
                    "https://github.com/Ugric/lamar-bot-js/blob/main/images/infomation%20icon.png?raw=true"
                )
                .setImage(
                    "https://github.com/Ugric/lamar-bot-js/blob/main/images/life%20invader.jpg?raw=true"
                )
                .setDescription(
                    `Follow people on Life Invader and tell people about your boring existance!`
                ),
        ],
    });
    await snooze(5000);
    await message.author.send({
        embeds: [
            new Discord.EmbedBuilder()
                .setAuthor({
                    name: message.author.tag,
                    iconURL: message.author.avatarURL() || undefined,
                })
                .setThumbnail(
                    "https://github.com/Ugric/lamar-bot-js/blob/main/images/infomation%20icon.png?raw=true"
                )
                .setImage(
                    "https://github.com/Ugric/lamar-bot-js/blob/main/images/your%20gonna%20be%20shot%20amigo.gif?raw=true"
                )
                .setDescription(`Have fun!`),
        ],
    });
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
};
