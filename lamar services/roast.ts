import { commandFunctionType } from "../command-handler";
import { DEV_MODE } from "../config";
import { Discord } from "../discordclient";
import errorMessage from "../error_message";
import { get_account } from "../postgres/account";
import { snooze } from "../snooze";

const roasting: Record<string, true> = {}

const roast = async (user: Discord.User) => {
    await user.send({
        embeds: [
            new Discord.EmbedBuilder()
                .setTitle(`${user.username}'s IFruit`)
                .setThumbnail(
                    "https://github.com/Ugric/lamar-bot-js/blob/main/images/ifruit.png?raw=true"
                ),
        ],
    });
    await snooze(1000);
    let typingmessage = await user.send({
        embeds: [
            new Discord.EmbedBuilder().setDescription(`Lamar is typing...`),
        ],
    });
    await snooze(5000);
    await typingmessage.edit({
        embeds: [
            new Discord.EmbedBuilder()
                .setAuthor({
                    name: "Lamar",
                    iconURL:
                        "https://github.com/Ugric/lamar-bot-js/blob/main/images/lamar%20profile.PNG?raw=true",
                })
                .setDescription(`Wassup, can a loc come up in your crib?`),
        ],
    });
    await snooze(1000);
    typingmessage = await user.send({
        embeds: [
            new Discord.EmbedBuilder().setDescription(`you are typing...`),
        ],
    });
    await snooze(2500);
    await typingmessage.edit({
        embeds: [
            new Discord.EmbedBuilder()
                .setAuthor({
                    name: user.tag,
                    iconURL: user.avatarURL() || undefined,
                })
                .setDescription(`Man fuck you, I'll see you at work.`),
        ],
    });
    await snooze(1000)
    typingmessage = await user.send({
        embeds: [
            new Discord.EmbedBuilder().setDescription(`Lamar is typing...`),
        ],
    });
    await snooze(5000);
    await typingmessage.edit({
        embeds: [
            new Discord.EmbedBuilder()
                .setAuthor({
                    name: "Lamar",
                    iconURL:
                        "https://github.com/Ugric/lamar-bot-js/blob/main/images/lamar%20profile.PNG?raw=true",
                })
                .setDescription(`Ah, nigga don't hate me cause I'm beautiful nigga`),
        ],
    });
    await snooze(1000)
    typingmessage = await user.send({
        embeds: [
            new Discord.EmbedBuilder().setDescription(`Lamar is typing...`),
        ],
    });
    await snooze(5000);
    await typingmessage.edit({
        embeds: [
            new Discord.EmbedBuilder().setDescription(
                `Maybe if you got rid of that old yee yee ass hair cut you get some bitches on your dick.`
            ),
        ],
    });
    await snooze(1000);
    typingmessage = await user.send({
        embeds: [
            new Discord.EmbedBuilder().setDescription(`Lamar is typing...`),
        ],
    });
    await snooze(5000);
    await typingmessage.edit({
        embeds: [
            new Discord.EmbedBuilder().setDescription(
                `Oh, better yet, Maybe Tanisha'll call your dog-ass if she ever stop fucking with that brain surgeon or lawyer she fucking with,`
            ),
        ],
    });
    
    await snooze(1000);
    typingmessage = await user.send({
        embeds: [
            new Discord.EmbedBuilder().setDescription(`Lamar is typing...`),
        ],
    });
    await snooze(2500);
    await typingmessage.edit({
        embeds: [new Discord.EmbedBuilder().setDescription(`***Niggaaa...***`)],
    });
    await snooze(2500);
    typingmessage = await user.send({
        embeds: [
            new Discord.EmbedBuilder().setDescription(`you are typing...`),
        ],
    });
    
    await snooze(5000);
    await typingmessage.edit({
        embeds: [
            new Discord.EmbedBuilder()
                .setAuthor({
                    name: user.tag,
                    iconURL: user.avatarURL() || undefined,
                })
                .setDescription(`What?!`),
        ],
    });
    await snooze(5000);
    await user.send({
        embeds: [
            new Discord.EmbedBuilder()
                .setDescription(`***Barber shops are now available***`),
        ],
    });
};

const roastPlayer: commandFunctionType = async (interaction) => {
    await interaction.deferReply({
        ephemeral: true,
    });
    const userID = interaction.member?.user.id;
    if (!userID) return;
    const account = await get_account(userID);
    if (!account) return;
    const playerToRoast = interaction.options.getUser("user");
    if (!playerToRoast) {
        await interaction.editReply({
            embeds: [
                errorMessage(
                    interaction,
                    "You need to specify a player to roast"
                ),
            ],
        });
        return;
    }
    if (playerToRoast.id == userID) {
        await interaction.editReply({
            embeds: [errorMessage(interaction, "You can't roast yourself")],
        });
        return;
    }
    const userToRoast = await get_account(playerToRoast.id);
    if (!userToRoast) {
        await interaction.editReply({
            embeds: [
                errorMessage(
                    interaction,
                    "The player you are trying to roast doesn't have an account"
                ),
            ],
        });
        return;
    }

    if (roasting[playerToRoast.id]) {
        await interaction.editReply({
            embeds: [
                errorMessage(
                    interaction,
                    "The player you are trying to roast is already being roasted"
                ),
            ],
        });
        return;
    }
        const charged = await account.money.transaction(
            -100000,
            `Roast ${playerToRoast.tag}`
        );
    if (!charged) {
        await interaction.editReply({
            embeds: [
                errorMessage(
                    interaction,
                    "You don't have enough money to roast a player"
                ),
            ],
        });
        return;
    }
    await interaction.editReply({
        embeds: [
            new Discord.EmbedBuilder()
                .setAuthor({
                    name: "Lamar",
                    iconURL:
                        "https://github.com/Ugric/lamar-bot-js/blob/main/images/lamar%20profile.PNG?raw=true",
                })
                .setDescription(
                    `You are roasting ${playerToRoast.tag} for $100,000`
                )
                .setColor("#00ff00"),
        ],
    });
    roasting[playerToRoast.id] = true
    await roast(playerToRoast)
    delete roasting[playerToRoast.id]
    await interaction.followUp({
        embeds: [
            new Discord.EmbedBuilder()
                .setAuthor({
                    name: "Lamar",
                    iconURL:
                        "https://github.com/Ugric/lamar-bot-js/blob/main/images/lamar%20profile.PNG?raw=true",
                })
                .setDescription(
                    `Roasted!`
                )
                .setColor("#00ff00"),
        ],
        ephemeral: true
    });
    return;
};

export { roastPlayer };
