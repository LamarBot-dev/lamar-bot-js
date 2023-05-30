import {
    CacheType,
    ChatInputCommandInteraction,
    GuildMember,
} from "discord.js";
import { commandFunctionType } from "../command-handler";
import {
    AudioResource,
    NoSubscriberBehavior,
    VoiceConnection,
    createAudioPlayer,
    createAudioResource,
    getVoiceConnection,
    joinVoiceChannel,
} from "@discordjs/voice";
import path from "path";
import errorMessage from "../error_message";
import { Discord } from "../discordclient";

const player = createAudioPlayer({
    behaviors: {
        noSubscriber: NoSubscriberBehavior.Play,
    },
});
let resource: AudioResource;

const getResource = () => {
    resource = createAudioResource(path.join(__dirname, "./radio/rl.mp3"));

    player.play(resource);
};
getResource();
player.on("stateChange", () => {
    if (resource.ended) {
        getResource();
    }
});

const runJoinVC = async (
    interaction: ChatInputCommandInteraction<CacheType>
): Promise<[VoiceConnection, string] | 1 | 2> => {
    if (
        !(interaction.member instanceof GuildMember) ||
        !interaction.guildId ||
        !interaction.guild
    ) {
        return 2;
    }
    if (
        !interaction.member.voice.channelId ||
        !interaction.member.voice.channel
    ) {
        return 1;
    }
    let connection = getVoiceConnection(interaction.guildId);
    if (!connection) {
        connection = joinVoiceChannel({
            channelId: interaction.member.voice.channelId,
            guildId: interaction.guildId,
            adapterCreator: interaction.guild.voiceAdapterCreator,
        });
    }
    return [connection, interaction.member.voice.channel.name];
};

const joinVC: commandFunctionType = async (interaction) => {
    await interaction.deferReply();
    const connection = await runJoinVC(interaction);
    switch (connection) {
        case 1:
            await interaction.editReply({
                embeds: [
                    errorMessage(
                        interaction,
                        "You must be in a voice channel to use this command.",
                        null
                    ),
                ],
            });
            break;
        case 2:
            await interaction.editReply({
                embeds: [
                    errorMessage(
                        interaction,
                        "This command can only be used in a server.",
                        null
                    ),
                ],
            });
            break;
        default:
            await interaction.editReply({
                content: `Joined ${connection[1]}`,
            });
            break;
    }
    return;
};

const playRadio: commandFunctionType = async (interaction) => {
    await interaction.deferReply();
    const connection = await runJoinVC(interaction);
    switch (connection) {
        case 1:
            await interaction.editReply({
                embeds: [
                    errorMessage(
                        interaction,
                        "You must be in a voice channel to use this command.",
                        null
                    ),
                ],
            });
            return;
        case 2:
            await interaction.editReply({
                embeds: [
                    errorMessage(
                        interaction,
                        "This command can only be used in a server.",
                        null
                    ),
                ],
            });
            return;
    }

    connection[0].subscribe(player);
    await interaction.editReply({
        embeds: [
            new Discord.EmbedBuilder()
                .setAuthor({
                    name: interaction.user.tag,
                    iconURL: interaction.user.avatarURL() || undefined,
                })
                .setTitle("Playing Radio Los Santos")
                .setThumbnail(
                    "https://github.com/Ugric/lamar-bot-js/blob/main/images/infomation%20icon.png?raw=true"
                )
                .setImage(
                    "https://github.com/Ugric/lamar-bot-js/blob/main/images/dancing%20lamar.gif?raw=true"
                ),
        ],
    });
};

const stopvc: commandFunctionType = async (interaction) => {
    await interaction.deferReply();
    if (
        !(interaction.member instanceof GuildMember) ||
        !interaction.guildId ||
        !interaction.guild
    ) {
        await interaction.editReply({
            embeds: [
                errorMessage(
                    interaction,
                    "This command can only be used in a server.",
                    null
                ),
            ],
        });
        return;
    }
    const connection = getVoiceConnection(interaction.guildId);
    if (!connection) {
        await interaction.editReply({
            embeds: [
                errorMessage(
                    interaction,
                    "LamarBot not in a voice channel.",
                    null
                ),
            ],
        });
        return;
    }
    const dispatch = connection.subscribe(createAudioPlayer());
    dispatch?.unsubscribe();
    await interaction.editReply({
        embeds: [
            new Discord.EmbedBuilder()
                .setAuthor({
                    name: interaction.user.tag,
                    iconURL: interaction.user.avatarURL() || undefined,
                })
                .setTitle("Stopped Radio Los Santos")
                .setThumbnail(
                    "https://github.com/Ugric/lamar-bot-js/blob/main/images/infomation%20icon.png?raw=true"
                )
                .setImage(
                    "https://github.com/Ugric/lamar-bot-js/blob/main/images/confused%20lamar.png?raw=true"
                ),
        ],
    });
};

const roastvc: commandFunctionType = async (interaction) => {
    await interaction.deferReply();
    const connection = await runJoinVC(interaction);
    switch (connection) {
        case 1:
            await interaction.editReply({
                embeds: [
                    errorMessage(
                        interaction,
                        "You must be in a voice channel to use this command.",
                        null
                    ),
                ],
            });
            return;
        case 2:
            await interaction.editReply({
                embeds: [
                    errorMessage(
                        interaction,
                        "This command can only be used in a server.",
                        null
                    ),
                ],
            });
            return;
    }
    const roastreasource = createAudioResource(
        path.join(__dirname, "./roast/roast.mp3")
    );
    const roastplayer = createAudioPlayer();
    roastplayer.play(roastreasource);
    connection[0].subscribe(roastplayer);
    await interaction.editReply({
        embeds: [
            new Discord.EmbedBuilder()
                .setAuthor({
                    name: interaction.user.tag,
                    iconURL: interaction.user.avatarURL() || undefined,
                })
                .setTitle(`Roasting everyone in ${connection[1]}`)
                .setThumbnail(
                    "https://github.com/Ugric/lamar-bot-js/blob/main/images/infomation%20icon.png?raw=true"
                )
                .setImage(
                    "https://github.com/Ugric/lamar-bot-js/blob/main/voice%20channel/roast/roast.gif?raw=true"
                ),
        ],
    });
};

const disconnectvc: commandFunctionType = async (interaction) => {
    await interaction.deferReply();
    if (
        !(interaction.member instanceof GuildMember) ||
        !interaction.guildId ||
        !interaction.guild
    ) {
        await interaction.editReply({
            embeds: [
                errorMessage(
                    interaction,
                    "This command can only be used in a server.",
                    null
                ),
            ],
        });
        return;
    }
    const connection = getVoiceConnection(interaction.guildId);
    if (!connection) {
        await interaction.editReply({
            embeds: [
                errorMessage(
                    interaction,
                    "LamarBot not in a voice channel.",
                    null
                ),
            ],
        });
        return;
    }
    connection.destroy();
    await interaction.editReply({
        embeds: [
            new Discord.EmbedBuilder()
                .setAuthor({
                    name: interaction.user.tag,
                    iconURL: interaction.user.avatarURL() || undefined,
                })
                .setTitle("Disconnected from voice channel")
                .setThumbnail(
                    "https://github.com/Ugric/lamar-bot-js/blob/main/images/infomation%20icon.png?raw=true"
                )
                .setImage(
                    "https://github.com/Ugric/lamar-bot-js/blob/main/images/confused%20lamar.png?raw=true"
                ),
        ],
    });
};

export { joinVC, playRadio, stopvc, disconnectvc, roastvc };
