import { Discord } from "./discordclient";

function errorMessage(
    interaction: Discord.Interaction<Discord.CacheType>,
    title: string|null = null,
    description: string|null = null
) {
    return new Discord.EmbedBuilder()
        .setAuthor({
            name: interaction.user.tag,
            iconURL: interaction.user.avatarURL() || undefined,
        })
        .setTitle(title)
        .setThumbnail(
            "https://github.com/Ugric/lamar-bot-js/blob/main/images/infomation%20icon.png?raw=true"
        )
        .setImage(
            "https://github.com/Ugric/lamar-bot-js/blob/main/images/no%20no%20no.gif?raw=true"
        )
        .setDescription(description);
}
export default errorMessage;