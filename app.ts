import { clientID, startup, token } from "./config";
import { client, Discord } from "./discordclient";
import { buttoncontrols, weedButtonIDs, weedstart } from "./weed/weed";
import getDatabase from "./postgres";
import { intro } from "./intromenu";
import { sql } from "slonik";
import { followplayer, twat, unfollowplayer } from "./lifeinvader";
import sendChannelMessage from "./lamar-channel-message";
import { closeFarm } from "./weed/weed";
import { joinVC, playRadio, stopvc } from "./voice channel/vc";
import errorMessage from "./error_message";
const rest = new Discord.REST().setToken(token);

const commands: Discord.RESTPostAPIChatInputApplicationCommandsJSONBody[] = [
    {
        name: "create",
        description: "Create your character!",
    },
    {
        name: "weed",
        description: "Start your weed farm!",
        options: [
            {
                name: "open",
                description: "Open your weed farm!",
                type: Discord.ApplicationCommandOptionType.Subcommand,
            },
            {
                name: "close",
                description: "Close your weed farm!",
                type: Discord.ApplicationCommandOptionType.Subcommand,
            },
        ],
    },
    {
        name: "lifeinvader",
        description: "the LifeInvader social network",
        options: [
            {
                name: "follow",
                description: "follow a user",
                type: Discord.ApplicationCommandOptionType.Subcommand,
                options: [
                    {
                        name: "user",
                        description: "the user to follow",
                        type: Discord.ApplicationCommandOptionType.User,
                        required: true,
                    },
                ],
            },
            {
                name: "unfollow",
                description: "unfollow a user",
                type: Discord.ApplicationCommandOptionType.Subcommand,
                options: [
                    {
                        name: "user",
                        description: "the user to unfollow",
                        type: Discord.ApplicationCommandOptionType.User,
                        required: true,
                    },
                ],
            },
            {
                name: "followers",
                description: "see your followers",
                type: Discord.ApplicationCommandOptionType.Subcommand,
            },
            {
                name: "following",
                description: "see who your following",
                type: Discord.ApplicationCommandOptionType.Subcommand,
            },
            {
                name: "post",
                description: "post a message",
                type: Discord.ApplicationCommandOptionType.Subcommand,
                options: [
                    {
                        name: "message",
                        description: "the message to post",
                        type: Discord.ApplicationCommandOptionType.String,
                        required: true,
                    },
                ],
            },
        ],
    },
    {
        name: "vc",
        description: "voice chat",
        options: [
            {
                name: "join",
                description: "join a voice channel",
                type: Discord.ApplicationCommandOptionType.Subcommand,
            },
            {
                name: "saysomething",
                description: "get lamar to say one of his lines",
                type: Discord.ApplicationCommandOptionType.Subcommand,
            },
            {
                name: "roast",
                description: "roast the vc",
                type: Discord.ApplicationCommandOptionType.Subcommand,
            },
            {
                name: "radio",
                description: "listen to the radio",
                type: Discord.ApplicationCommandOptionType.Subcommand,
            },
            {
                name: "stop",
                description: "stop the current task",
                type: Discord.ApplicationCommandOptionType.Subcommand,
            },
            {
                name: "leave",
                description: "leave a voice channel",
                type: Discord.ApplicationCommandOptionType.Subcommand,
            },
        ],
    },
];

console.log(commands);

client.on("guildCreate", async (guild) => {
    console.log("joined a guild!");
    console.table({
        name: guild.name,
        id: guild.id,
        membercount: guild.memberCount,
    });
    const owner = await guild.fetchOwner();
    console.table({
        owner: owner.user.tag,
        ownerid: owner.id,
    });
    guild.channels.cache.forEach((channel) => {
        if (channel.name.includes("lamar-bot") && channel.isTextBased()) {
            sendChannelMessage(channel);
        }
    });
});

client.on("ready", async () => {
    console.log(`Logged in as ${client.user?.tag}!`);
    console.log("connecting database...");
    await getDatabase();
    console.log("connected!");
    if (startup) {
        await rest
            .get(Discord.Routes.applicationCommands(clientID))
            .then((data: any) => {
                const promises = [];
                for (const command of data) {
                    const deleteUrl: `/${string}` = `${Discord.Routes.applicationCommands(
                        clientID
                    )}/${command.id}`;
                    promises.push(rest.delete(deleteUrl));
                }
                return Promise.all(promises);
            });
        await rest.put(Discord.Routes.applicationCommands(clientID), {
            body: commands,
        });
    }
    process
        .on("unhandledRejection", console.error)
        .on("uncaughtException", console.error);
});

client.on("channelCreate", async (channel) => {
    if (channel.name.includes("lamar-bot") && channel.isTextBased()) {
        sendChannelMessage(channel);
    }
});

client.on("channelUpdate", async (oldChannel, newChannel) => {
    if (
        "name" in newChannel &&
        "nsfw" in oldChannel &&
        newChannel.name.includes("lamar-bot") &&
        newChannel.isTextBased() &&
        newChannel.nsfw != oldChannel.nsfw
    ) {
        sendChannelMessage(newChannel);
    }
});

client.on("interactionCreate", async (interaction) => {
    const pool = await getDatabase();
    if (interaction.isChatInputCommand()) {
        const account = await pool.maybeOne(sql`
            SELECT * FROM accounts WHERE id = ${interaction.user.id}
        `);
        switch (interaction.commandName) {
            case "create":
                if (!account) await intro(interaction);
                else
                    await interaction.reply({
                        embeds: [
                            new Discord.EmbedBuilder()
                                .setAuthor({
                                    name: interaction.user.tag,
                                    iconURL:
                                        interaction.user.avatarURL() ||
                                        undefined,
                                })
                                .setTitle("You already have an account!")
                                .setThumbnail(
                                    "https://github.com/Ugric/lamar-bot-js/blob/main/images/infomation%20icon.png?raw=true"
                                )
                                .setImage(
                                    "https://github.com/Ugric/lamar-bot-js/blob/main/images/no%20no%20no.gif?raw=true"
                                ),
                        ],
                        ephemeral: true,
                    });
                return;
            case "weed":
                if (account) {
                    const Subcommand = interaction.options.getSubcommand();
                    switch (Subcommand) {
                        case "open":
                            weedstart(interaction);
                            return;
                        case "close":
                            await interaction.deferReply({
                                ephemeral: true,
                            });
                            await closeFarm(interaction.user.id);
                            await interaction.deleteReply();
                            return;
                    }
                }
                break;
            case "lifeinvader":
                if (account) {
                    const Subcommand = interaction.options.getSubcommand();
                    switch (Subcommand) {
                        case "follow":
                            followplayer(interaction);
                            return;
                        case "unfollow":
                            unfollowplayer(interaction);
                            return;
                        case "followers":
                            return;
                        case "following":
                            return;
                        case "post":
                            twat(interaction);
                            return;
                    }
                }
                break;
            case "vc":
                if (account) {
                    const Subcommand = interaction.options.getSubcommand();
                    switch (Subcommand) {
                        case "join":
                            joinVC(interaction);
                            return;
                        case "radio":
                            playRadio(interaction);
                            return;
                        case "stop":
                            stopvc(interaction);
                            return;
                    }
                }
                break;
        }
        if (account)
            await interaction.reply({
                embeds: [
                    new Discord.EmbedBuilder()
                        .setAuthor({
                            name: interaction.user.tag,
                            iconURL: interaction.user.avatarURL() || undefined,
                        })
                        .setTitle("command not found!")
                        .setThumbnail(
                            "https://github.com/Ugric/lamar-bot-js/blob/main/images/infomation%20icon.png?raw=true"
                        )
                        .setImage(
                            "https://github.com/Ugric/lamar-bot-js/blob/main/images/no%20no%20no.gif?raw=true"
                        ),
                ],
                ephemeral: true,
            });
        else
            await interaction.reply({
                embeds: [
                    errorMessage(
                        interaction,
                        "You don't have an account!",
                        "Use `/create` to create an account!"
                    ),
                ],
                ephemeral: true,
            });

        return;
    } else if (interaction.type != Discord.InteractionType.MessageComponent)
        return;
    const button = interaction;
    if (button.member?.user || button.guildId === null) {
        if (weedButtonIDs.includes(button.customId)) {
            buttoncontrols(button);
        } else {
            await button.reply({
                embeds: [
                    errorMessage(button, "unknown button!", null),
                    new Discord.EmbedBuilder()
                        .setAuthor({
                            name: button.user.tag,
                            iconURL: button.user.avatarURL() || undefined,
                        })
                        .setTitle("unknown button!")
                        .setThumbnail(
                            "https://github.com/Ugric/lamar-bot-js/blob/main/images/infomation%20icon.png?raw=true"
                        )
                        .setImage(
                            "https://github.com/Ugric/lamar-bot-js/blob/main/images/no%20no%20no.gif?raw=true"
                        ),
                ],
            });
        }
    }

    await button.deferUpdate();
});

client.login(token);
