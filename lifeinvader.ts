import { commandFunctionType } from "./command-handler";
import data from "./data";
import { Discord, client } from "./discordclient";
import { getuserfrommention } from "./getuserfrommention";

const followplayer: commandFunctionType = async ({ args, message }) => {
    if (!args[0])
        return await message.channel.send({
            embeds: [
                new Discord.EmbedBuilder()
                    .setTitle("OH NO!")
                    .setDescription("add a mention!")
                    .setThumbnail(
                        "https://github.com/Ugric/lamar-bot-js/blob/main/images/infomation%20icon.png?raw=true"
                    ),
            ],
        });
    const mentionid = getuserfrommention(args[0]);
    if (mentionid) {
        if (mentionid != message.author.id) {
            if (data.current.users[mentionid]) {
                const account = data.current.users[mentionid];
                if (
                    !account.lifeinvader.followers.includes(message.author.id)
                ) {
                    account.lifeinvader.followers.push(message.author.id);
                    client.users
                        .fetch(mentionid)
                        .then((user) => {
                            user.send({
                                embeds: [
                                    new Discord.EmbedBuilder()
                                        .setAuthor({
                                            name: message.author.tag,
                                            iconURL:
                                                message.author.avatarURL() ||
                                                undefined,
                                        })
                                        .setTitle("New Follower!")
                                        .setThumbnail(
                                            "https://github.com/Ugric/lamar-bot-js/blob/main/images/life%20invader%20small.png?raw=true"
                                        )
                                        .setDescription(
                                            `${message.author.tag} just followed you, you now have ${account.lifeinvader.followers.length} followers!`
                                        )
                                        .setTimestamp(new Date().getTime()),
                                ],
                            })
                                .then(() => {
                                    console.log(
                                        `follow message sent to ${user.tag}`
                                    );
                                })
                                .catch(console.error);
                        })
                        .catch(console.error);
                    await message.channel.send({
                        embeds: [
                            new Discord.EmbedBuilder()
                                .setTitle("YAY!")
                                .setDescription("you are now following them!")
                                .setThumbnail(
                                    "https://github.com/Ugric/lamar-bot-js/blob/main/images/life%20invader%20small.png?raw=true"
                                ),
                        ],
                    });
                } else {
                    await message.channel.send({
                        embeds: [
                            new Discord.EmbedBuilder()
                                .setTitle("OH NO!")
                                .setDescription("your already following them!")
                                .setThumbnail(
                                    "https://github.com/Ugric/lamar-bot-js/blob/main/images/life%20invader%20small.png?raw=true"
                                ),
                        ],
                    });
                }
            } else {
                await message.channel.send({
                    embeds: [
                        new Discord.EmbedBuilder()
                            .setTitle("OH NO!")
                            .setDescription(
                                "user doesn't have an account with life invader!"
                            )
                            .setThumbnail(
                                "https://github.com/Ugric/lamar-bot-js/blob/main/images/life%20invader%20small.png?raw=true"
                            ),
                    ],
                });
            }
        } else {
            await message.channel.send({
                embeds: [
                    new Discord.EmbedBuilder()
                        .setTitle("OH NO!")
                        .setDescription("you can't follow yourself, sad person!")
                        .setThumbnail(
                            "https://github.com/Ugric/lamar-bot-js/blob/main/images/life%20invader%20small.png?raw=true"
                        ),
                ],
            });
        }
    } else {
        await message.channel.send({
            embeds: [
                new Discord.EmbedBuilder()
                    .setTitle("OH NO!")
                    .setDescription("add a valid mention!")
                    .setThumbnail(
                        "https://github.com/Ugric/lamar-bot-js/blob/main/images/infomation%20icon.png?raw=true"
                    ),
            ],
        });
    }
};

const twaat: commandFunctionType = async ({ args, message }) => {
    const twaatembed = new Discord.EmbedBuilder()
        .setAuthor({
            name: message.author.tag,
            iconURL: message.author.avatarURL()||undefined,
        })
        .setTitle("New Twaat!")
        .setThumbnail(
            "https://github.com/Ugric/lamar-bot-js/blob/main/images/life%20invader%20small.png?raw=true"
        )
        .setDescription(args.join(" "))
        .setTimestamp(new Date().getTime());
    message.author.send({ content: "twaat sent!", embeds: [twaatembed] });
    const account = data.current.users[message.author.id];
    for (const userid of account.lifeinvader.followers) {
        client.users
            .fetch(userid)
            .then((user) => {
                user.send({
                    embeds: [twaatembed],
                })
                    .then(() => {
                        console.log(`twaat sent to ${user.tag}`);
                    })
                    .catch(console.error);
            })
            .catch(console.error);
    }
};

export { twaat, followplayer };
