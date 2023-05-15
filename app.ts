import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { client, Discord } from "./discordclient";

dotenv.config();
const token = process.env.TOKEN ?? "";
const clientID = process.env.CLIENT_ID ?? "";
const rest = new Discord.REST().setToken(token);

// custom games
import { buttoncontrols, weedButtonIDs, weedstart } from "./weed";
import getDatabase from "./postgres";

const commands: Discord.SlashCommandBuilder[] = [
    new Discord.SlashCommandBuilder()
        .setName("help")
        .setDescription("help menu"),
    new Discord.SlashCommandBuilder()
        .setName("weed")
        .setDescription("weed game"),
];

console.log(commands);

const helpmenu = (
    message: Discord.Message,
    title: string | undefined,
    commands: Discord.RestOrArray<Discord.APIEmbedField>
) =>
    new Discord.EmbedBuilder()
        .setAuthor({
            name: message.author.tag,
            iconURL: message.author.avatarURL() || undefined,
        })
        .setThumbnail(
            "https://github.com/Ugric/lamar-bot-js/blob/main/images/infomation%20icon.png?raw=true"
        )
        .setTitle(`HELP MENU${title ? ": " + title : ""}`)
        .setDescription("commands:")
        .addFields(...commands);

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
    try {
        console.log(
            `Started refreshing ${commands.length} application (/) commands.`
        );

        // The put method is used to fully refresh all commands in the guild with the current set
        await rest
            .get(Discord.Routes.applicationGuildCommands(clientID, guild.id))
            .then((data: any) => {
                const promises = [];
                for (const command of data) {
                    const deleteUrl: `/${string}` = `${Discord.Routes.applicationGuildCommands(
                        clientID,
                        guild.id
                    )}/${command.id}`;
                    promises.push(rest.delete(deleteUrl));
                }
                return Promise.all(promises);
            });
        const data: any = await rest.put(
            Discord.Routes.applicationGuildCommands(clientID, guild.id),
            { body: commands.map((val) => val.toJSON()) }
        );

        console.log(
            `Successfully reloaded ${data.length} application (/) commands.`
        );
    } catch (error) {
        // And of course, make sure you catch and log any errors!
        console.error(error);
    }
});

client.on("ready", () => {
    console.log(`Logged in as ${client.user?.tag}!`);
    console.log("connecting database...");
    getDatabase();
    console.log("connected!");
});

client.on("interactionCreate", async (interaction) => {
    if (interaction.type == Discord.InteractionType.ApplicationCommand) {
        if (interaction.commandName == "weed") {
            console.log("weed command");
            weedstart({
                message: interaction,
                args: interaction.options.data,
            });
        } else if (interaction.commandName == "intro") {
            console.log("intro command");
        }
        return;
    } else if (interaction.type != Discord.InteractionType.MessageComponent) return;
    const button = interaction;
    if (button.member?.user) {
        button.deferUpdate().catch(console.error);
        if (weedButtonIDs.includes(button.customId)) {
            buttoncontrols(button);
        } else {
            button
                .reply({
                    embeds: [
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
                })
                .catch(console.error);
        }
    } else {
        button.deferUpdate().catch(console.error);
    }
});

client.login(token);
