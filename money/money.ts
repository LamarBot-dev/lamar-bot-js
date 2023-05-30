import { commandFunctionType } from "../command-handler";
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
    const money = await account.money();
    await interaction.editReply({
        embeds: [
            new Discord.EmbedBuilder()
                .setTitle("Balance")
                .setDescription(`You have $${numberWithCommas(money)}`)
                .setColor("#00ff00"),
        ],
    });
    return;
};

export { balance, numberWithCommas };
