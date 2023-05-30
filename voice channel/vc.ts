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
                content: "You must be in a voice channel to use this command.",
            });
            break;
        case 2:
            await interaction.editReply({
                content: "This command can only be used in a server.",
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
            await interaction.reply({
                content: "You must be in a voice channel to use this command.",
            });
            return;
        case 2:
            await interaction.reply({
                content: "This command can only be used in a server.",
            });
            return;
    }

    connection[0].subscribe(player);
    await interaction.editReply({
        content: `Playing \`Radio Los Santos\` in ${connection[1]}`,
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
            content: "This command can only be used in a server.",
        });
        return;
    }
    const connection = getVoiceConnection(interaction.guildId);
    if (!connection) {
        await interaction.editReply({
            content: "I am not in a voice channel.",
        });
        return;
    }
    const dispatch = connection.subscribe(createAudioPlayer());
    dispatch?.unsubscribe();
    await interaction.editReply({
        content: "Stopped playing audio.",
    });
};

const roastvc: commandFunctionType = async (interaction) => {
     await interaction.deferReply();
    const connection = await runJoinVC(interaction);
    switch (connection) {
        case 1:
            await interaction.reply({
                content: "You must be in a voice channel to use this command.",
            });
            return;
        case 2:
            await interaction.reply({
                content: "This command can only be used in a server.",
            });
            return;
    }
    const roastreasource = createAudioResource(path.join(__dirname, "./roast/roast.mp3"));
    const roastplayer = createAudioPlayer();
    roastplayer.play(roastreasource);
    connection[0].subscribe(roastplayer);
    await interaction.editReply({
        content: `Roasting everyone in ${connection[1]}`,
    });
}

const disconnectvc: commandFunctionType = async (interaction) => {
    await interaction.deferReply();
    if (
        !(interaction.member instanceof GuildMember) ||
        !interaction.guildId ||
        !interaction.guild
    ) {
        await interaction.editReply({
            content: "This command can only be used in a server.",
        });
        return;
    }
    const connection = getVoiceConnection(interaction.guildId);
    if (!connection) {
        await interaction.editReply({
            content: "I am not in a voice channel.",
        });
        return;
    }
    connection.destroy();
    await interaction.editReply({
        content: "Disconnected from voice channel.",
    });
};
            

export { joinVC, playRadio, stopvc, disconnectvc, roastvc };
