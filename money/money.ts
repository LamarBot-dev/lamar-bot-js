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
                .setTitle("Balance")
                .setDescription(`You have $${numberWithCommas(money)}`)
                .setColor("#ff0000")
                .setThumbnail(
                    "https://github.com/LamarBot-dev/lamar-bot-js/blob/main/images/maze%20bank%20logo.jpg?raw=true"
                ),
        ],
    });
    return;
};

export { balance, numberWithCommas };
