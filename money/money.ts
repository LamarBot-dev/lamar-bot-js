import { commandFunctionType } from "../command-handler";
import { DEV_MODE } from "../config";
import { Discord } from "../discordclient";
import { get_account } from "../postgres/account";

function numberWithCommas(x: number) {
    return String(x).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

const balance: commandFunctionType = async (interaction) => {
    await interaction.deferReply({
        ephemeral: true,
    });
    const account = await get_account(interaction.user.id);
    if (!account) {
        return;
    }
    if (DEV_MODE) {
        await account.money.transaction(1000000000, "dev money");
    }
    const money = await account.money.balance();
    await interaction.editReply({
        embeds: [
            new Discord.EmbedBuilder()
                .setTitle("Maze Bank")
                .setDescription(`You have $${numberWithCommas(money)}`)
                .setColor("#ff0000")
                .setThumbnail(
                    "https://github.com/LamarBot-dev/lamar-bot-js/blob/main/images/maze%20bank%20logo.jpg?raw=true"
                ),
        ],
    });
    return;
};

const pay: commandFunctionType = async (interaction) => {
    await interaction.deferReply({
        ephemeral: true,
    });
    const account = await get_account(interaction.user.id);
    if (!account) {
        return;
    }
    const money = await account.money.balance();
    const amount = interaction.options.getInteger("amount", true);
    const target = interaction.options.getUser("user", true);
    const target_account = await get_account(target.id);
    if (!target_account) {
        await interaction.editReply({
            embeds: [
                new Discord.EmbedBuilder()
                    .setTitle("Maze Bank")
                    .setDescription(`That user doesn't have an account`)
                    .setColor("#ff0000")
                    .setThumbnail(
                        "https://github.com/LamarBot-dev/lamar-bot-js/blob/main/images/maze%20bank%20logo.jpg?raw=true"
                    ),
            ],
        });
        return;
    } else if (target.id == interaction.user.id) {
        await interaction.editReply({
            embeds: [
                new Discord.EmbedBuilder()
                    .setTitle("Maze Bank")
                    .setDescription(`You can't pay yourself`)
                    .setColor("#ff0000")
                    .setThumbnail(
                        "https://github.com/LamarBot-dev/lamar-bot-js/blob/main/images/maze%20bank%20logo.jpg?raw=true"
                    ),
            ],
        });
        return;
    } else if (amount < 0) {
        await interaction.editReply({
            embeds: [
                new Discord.EmbedBuilder()
                    .setTitle("Maze Bank")
                    .setDescription(`You can't pay a negative amount`)
                    .setColor("#ff0000")
                    .setThumbnail(
                        "https://github.com/LamarBot-dev/lamar-bot-js/blob/main/images/maze%20bank%20logo.jpg?raw=true"
                    ),
            ],
        });
        return;
    } else if (amount > money) {
        await interaction.editReply({
            embeds: [
                new Discord.EmbedBuilder()
                    .setTitle("Maze Bank")
                    .setDescription(
                        `You don't have enough money to pay $${numberWithCommas(
                            amount
                        )}`
                    )
                    .setColor("#ff0000")
                    .setThumbnail(
                        "https://github.com/LamarBot-dev/lamar-bot-js/blob/main/images/maze%20bank%20logo.jpg?raw=true"
                    ),
            ],
        });
        return;
    }
    const moneyafterfee = Math.floor(amount * 0.9);
    await account.money.transaction(-amount, "pay");
    await target_account.money.transaction(
        moneyafterfee,
        `paid by ${interaction.user.tag}`
    );
    await Promise.all([
        interaction.editReply({
            embeds: [
                new Discord.EmbedBuilder()
                    .setTitle("Maze Bank")
                    .setDescription(
                        `You paid $${numberWithCommas(
                            moneyafterfee
                        )} (10% transfer fee) to ${target.tag}`
                    )
                    .setColor("#ff0000")
                    .setThumbnail(
                        "https://github.com/LamarBot-dev/lamar-bot-js/blob/main/images/maze%20bank%20logo.jpg?raw=true"
                    ),
            ],
        }),
        target.send({
            embeds: [
                new Discord.EmbedBuilder()
                    .setTitle("Maze Bank")
                    .setDescription(
                        `${interaction.user.tag} paid you $${numberWithCommas(
                            moneyafterfee
                        )}`
                    )
                    .setColor("#ff0000")
                    .setThumbnail(
                        "https://github.com/LamarBot-dev/lamar-bot-js/blob/main/images/maze%20bank%20logo.jpg?raw=true"
                    ),
            ],
        }),
    ]);
    return;
};

export { balance, numberWithCommas, pay };
