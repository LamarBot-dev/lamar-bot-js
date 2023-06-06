import { commandFunctionType } from "../command-handler";
import { get_account } from "../postgres/account";
import errorMessage from "../error_message";
import { snooze } from "../snooze";
import { Discord } from "../discordclient";
import { roasting } from "../lamar services/roast";
import { DEV_MODE } from "../config";

const sendMessage: commandFunctionType = async (interaction) => {
    await interaction.deferReply({
        ephemeral: true,
    });
    const userID = interaction.user.id;
    const account = await get_account(userID);
    if (!account) {
        await interaction.editReply({
            embeds: [
                errorMessage(
                    interaction,
                    "You need to have an account to message someone"
                ),
            ],
        });
        return;
    }
    const user = interaction.options.getUser("user");
    if (!user) {
        await interaction.editReply({
            embeds: [
                errorMessage(
                    interaction,
                    "You need to specify a player to message"
                ),
            ],
        });
        return;
    }
    if (user.id == userID && !DEV_MODE) {
        await interaction.editReply({
            embeds: [errorMessage(interaction, "You can't message yourself")],
        });
        return;
    }

    if (roasting[user.id]) {
        await interaction.editReply({
            embeds: [
                errorMessage(interaction, "They are already being contacted"),
            ],
        });
        return;
    }
    const userToMessage = await get_account(user.id);
    if (!userToMessage) {
        await interaction.editReply({
            embeds: [
                errorMessage(
                    interaction,
                    "The player you are trying to message doesn't have an account"
                ),
            ],
        });
        return;
    }
    const message = interaction.options.getString("message");
    if (!message) {
        await interaction.editReply({
            embeds: [
                errorMessage(
                    interaction,
                    "You need to specify a message to send"
                ),
            ],
        });
        return;
    }
    const charged = await account.money.transaction(
        -100000,
        `anonymous message to ${user.tag}`
    );
    if (!charged) {
        await interaction.editReply({
            embeds: [
                errorMessage(
                    interaction,
                    "You don't have enough money to send an anonymous message"
                ),
            ],
        });
        return;
    }
    roasting[user.id] = true;
    await interaction.editReply({
        embeds: [
            new Discord.EmbedBuilder()
                .setTitle("Message senting..."),
        ],
    });
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
                .setDescription(message),
        ],
    });
    await interaction.editReply({
        embeds: [
            new Discord.EmbedBuilder()
                .setTitle("Message sent")
                .setColor("#0099ff")
                .setDescription(
                    `You have sent an anonymous message to ${user.tag}`
                )
                .setTimestamp(new Date()),
        ],
    });
    delete roasting[user.id];
};

export default sendMessage;
