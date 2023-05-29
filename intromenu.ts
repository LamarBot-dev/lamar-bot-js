import { Discord } from "./discordclient";
import { snooze } from "./snooze";
import { commandFunctionType } from "./command-handler";
import getDatabase from "./postgres";
import { init_account } from "./postgres/account";
import { clientID } from "./config";

const inintro: string[] = [];
export const intro: commandFunctionType = async (message) => {
    if (inintro.includes(message.user.id)) return;
    inintro.push(message.user.id);
    await message.deferReply({
        ephemeral: true,
    });
    const initalmessage =  await message.user.send({
        embeds: [
            new Discord.EmbedBuilder()
                .setAuthor({
                    name: message.user.tag,
                    iconURL: message.user.avatarURL() || undefined,
                })
                .setThumbnail(
                    "https://github.com/Ugric/lamar-bot-js/blob/main/images/infomation%20icon.png?raw=true"
                )
                .setImage(
                    "https://github.com/Ugric/lamar-bot-js/blob/main/images/tv%20micheal.gif?raw=true"
                )
                .setDescription(
                    `Hello ${message.user.username}, and welcome to the Lamar Bot experience!`
                ),
        ],
    });
    message.editReply({
        embeds: [
            new Discord.EmbedBuilder()
                .setAuthor({
                    name: message.user.tag,
                    iconURL: message.user.avatarURL() || undefined,
                })
                .setDescription(
                    `This intro continues in your [DMs](${initalmessage.url})!`
                ),
        ],
    });
    await snooze(5000);
    await message.user.send({
        embeds: [
            new Discord.EmbedBuilder()
                .setTitle(`${message.user.username}'s IFruit`)
                .setThumbnail(
                    "https://github.com/Ugric/lamar-bot-js/blob/main/images/ifruit.png?raw=true"
                ),
        ],
    });
    let typingmessage = await message.user.send({
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
                .setDescription(`What up, its ya boy LD.`),
        ],
    });
    await snooze(2500);
    typingmessage = await message.user.send({
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
    typingmessage = await message.user.send({
        embeds: [
            new Discord.EmbedBuilder().setDescription(`you are typing...`),
        ],
    });
    await snooze(5000);
    await typingmessage.edit({
        embeds: [
            new Discord.EmbedBuilder()
                .setAuthor({
                    name: message.user.tag,
                    iconURL: message.user.avatarURL() || undefined,
                })
                .setDescription(`Yeah thats me.`),
        ],
    });
    await snooze(2500);
    typingmessage = await message.user.send({
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
    await message.user.send({
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
    await message.user.send({
        embeds: [
            new Discord.EmbedBuilder()
                .setAuthor({
                    name: message.user.tag,
                    iconURL: message.user.avatarURL() || undefined,
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
    await message.user.send({
        embeds: [
            new Discord.EmbedBuilder()
                .setAuthor({
                    name: message.user.tag,
                    iconURL: message.user.avatarURL() || undefined,
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
    await message.user.send({
        embeds: [
            new Discord.EmbedBuilder()
                .setAuthor({
                    name: message.user.tag,
                    iconURL: message.user.avatarURL() || undefined,
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
    await message.user.send({
        embeds: [
            new Discord.EmbedBuilder()
                .setAuthor({
                    name: message.user.tag,
                    iconURL: message.user.avatarURL() || undefined,
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
    // create a new user in the database
    init_account(message.user);
    inintro.splice(inintro.indexOf(message.user.id), 1);
};
