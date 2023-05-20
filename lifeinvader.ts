import { commandFunctionType } from "./command-handler";
import { Discord, client } from "./discordclient";
import { getuserfrommention } from "./getuserfrommention";
import { get_account } from "./postgres/account";

const followplayer: commandFunctionType = async (message) => {
    const user = message.options.getUser("user", true);
    const mentionid = user?.id;
    const account = await get_account(message.user.id);
    if (!account) return;
    if (mentionid) {
        if (mentionid != message.user.id) {
            if ((await get_account(mentionid))) {
                const following = await account.lifeinvader.following();
                if (!following.includes(mentionid)) {
                    await account.lifeinvader.follow(mentionid);
                    const user = await client.users.fetch(mentionid);
                    await user
                        .send({
                            embeds: [
                                new Discord.EmbedBuilder()
                                    .setAuthor({
                                        name: message.user.tag,
                                        iconURL:
                                            message.user.avatarURL() ||
                                            undefined,
                                    })
                                    .setTitle("New Follower!")
                                    .setThumbnail(
                                        "https://github.com/Ugric/lamar-bot-js/blob/main/images/life%20invader%20small.png?raw=true"
                                    )
                                    .setDescription(
                                        `${
                                            message.user.tag
                                        } just followed you, you now have ${(await account.lifeinvader.followers()).length} followers!`
                                    )
                                    .setTimestamp(new Date().getTime()),
                            ],
                        })
                        .then(() => {
                            console.log(`follow message sent to ${user.tag}`);
                        })
                        .catch(console.error);
                    await message.reply({
                        embeds: [
                            new Discord.EmbedBuilder()
                                .setTitle("YAY!")
                                .setDescription("you are now following them!")
                                .setThumbnail(
                                    "https://github.com/Ugric/lamar-bot-js/blob/main/images/life%20invader%20small.png?raw=true"
                                ),
                        ],
                        ephemeral: true,
                    });
                } else {
                    await message.reply({
                        embeds: [
                            new Discord.EmbedBuilder()
                                .setTitle("OH NO!")
                                .setDescription("your already following them!")
                                .setThumbnail(
                                    "https://github.com/Ugric/lamar-bot-js/blob/main/images/life%20invader%20small.png?raw=true"
                                ),
                        ],
                        ephemeral: true,
                    });
                }
            } else {
                await message.reply({
                    embeds: [
                        new Discord.EmbedBuilder()
                            .setTitle("OH NO!")
                            .setDescription(
                                `${user.tag} doesn't have an account with life invader!`
                            )
                            .setThumbnail(
                                "https://github.com/Ugric/lamar-bot-js/blob/main/images/life%20invader%20small.png?raw=true"
                            ),
                    ],
                    ephemeral: true,
                });
            }
        } else {
            await message.reply({
                embeds: [
                    new Discord.EmbedBuilder()
                        .setTitle("OH NO!")
                        .setDescription("you can't follow yourself, saddo!")
                        .setThumbnail(
                            "https://github.com/Ugric/lamar-bot-js/blob/main/images/life%20invader%20small.png?raw=true"
                        ),
                ],
                ephemeral: true,
            });
        }
    } else {
        await message.reply({
            embeds: [
                new Discord.EmbedBuilder()
                    .setTitle("OH NO!")
                    .setDescription("add a valid mention!")
                    .setThumbnail(
                        "https://github.com/Ugric/lamar-bot-js/blob/main/images/infomation%20icon.png?raw=true"
                    ),
            ],
            ephemeral: true,
        });
    }
};

const unfollowplayer: commandFunctionType = async (message) => {
    const user = message.options.getUser("user", true);
    const mentionid = user?.id;
    const account = await get_account(message.user.id);
    if (!account) return;
    if (mentionid) {
        if (mentionid != message.user.id) {
            if ((await get_account(mentionid))) {
                const following = await account.lifeinvader.following();
                if (following.includes(mentionid)) {
                    await account.lifeinvader.unfollow(mentionid);

                    await message.reply({
                        embeds: [
                            new Discord.EmbedBuilder()
                                .setTitle("YAY!")
                                .setDescription(
                                    "you are no longer following them!"
                                )
                                .setThumbnail(
                                    "https://github.com/Ugric/lamar-bot-js/blob/main/images/life%20invader%20small.png?raw=true"
                                ),
                        ],
                        ephemeral: true,
                    });
                } else {
                    await message.reply({
                        embeds: [
                            new Discord.EmbedBuilder()
                                .setTitle("OH NO!")
                                .setDescription("you're not following them!")
                                .setThumbnail(
                                    "https://github.com/Ugric/lamar-bot-js/blob/main/images/life%20invader%20small.png?raw=true"
                                ),
                        ],
                        ephemeral: true,
                    });
                }
            } else {
                await message.reply({
                    embeds: [
                        new Discord.EmbedBuilder()
                            .setTitle("OH NO!")
                            .setDescription(
                                `${user.tag} doesn't have an account with life invader!`
                            )
                            .setThumbnail(
                                "https://github.com/Ugric/lamar-bot-js/blob/main/images/life%20invader%20small.png?raw=true"
                            ),
                    ],
                    ephemeral: true,
                });
            }
        } else {
            await message.reply({
                embeds: [
                    new Discord.EmbedBuilder()
                        .setTitle("OH NO!")
                        .setDescription("you can't unfollow yourself, lmfao!")
                        .setThumbnail(
                            "https://github.com/Ugric/lamar-bot-js/blob/main/images/life%20invader%20small.png?raw=true"
                        ),
                ],
                ephemeral: true,
            });
        }
    } else {
        await message.reply({
            embeds: [
                new Discord.EmbedBuilder()
                    .setTitle("OH NO!")
                    .setDescription("add a valid mention!")
                    .setThumbnail(
                        "https://github.com/Ugric/lamar-bot-js/blob/main/images/life%20invader%20small.png?raw=true"
                    ),
            ],
            ephemeral: true,
        });
    }
};
const twat: commandFunctionType = async (message) => {
    const msg = message.options.getString("message", true);
    const twaatembed = new Discord.EmbedBuilder()
        .setAuthor({
            name: message.user.tag,
            iconURL: message.user.avatarURL() || undefined,
        })
        .setTitle("New Twaat!")
        .setThumbnail(
            "https://github.com/Ugric/lamar-bot-js/blob/main/images/life%20invader%20small.png?raw=true"
        )
        .setDescription(msg)
        .setTimestamp(new Date().getTime());
    message.reply({
        content: "twat sent!",
        embeds: [twaatembed],
        ephemeral: true,
    });
    const account = await get_account(message.user.id);
    if (!account) return;
    const followers = await account.lifeinvader.followers();
    for (const userid of followers) {
        client.users
            .fetch(userid)
            .then((user) => {
                user.send({
                    embeds: [twaatembed],
                })
                    .then(() => {
                        console.log(`twat sent to ${user.tag}`);
                    })
                    .catch(console.error);
            })
            .catch(console.error);
    }
};

export { twat, followplayer, unfollowplayer };
