import { sql } from "slonik";
import { buttonControlsFunction } from "./buttonControls";
import { commandFunctionType } from "./command-handler";
import { Discord } from "./discordclient";
import getDatabase from "./postgres";
import { get_account } from "./postgres/account";
const referencetouser: Record<string, string> = {};
const weedmenu: Record<string, Discord.Message> = {};
const weedupgradesmenu: Record<string, Discord.Message> = {};

const weedButtonIDs = [
    "wbuymax",
    "wplant",
    "wpick",
    "wsellall",
    "wuseeds",
    "wugrowing",
    "wustorage",
];

function numberWithCommas(x: number) {
    return String(x).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

const buttoncontrols: buttonControlsFunction = async (button) => {
    const pool = await getDatabase();
    if (
        button.message &&
        referencetouser[button.message.id] == button.user.id
    ) {
        const account = await get_account(button.user);
        if (!account) return;
        let update = false;
        let updateupgrades = false;
        if (button.customId == "wbuymax") {
            if (await account.weed.buy_seeds()) update = true;
        } else if (button.customId == "wplant") {
            if (await account.weed.plant()) update = true;
        } else if (button.customId == "wpick") {
            if (await account.weed.pick()) update = true;
        } else if (button.customId == "wsellall") {
            if (await account.weed.sell()) update = true;
        } else if (button.customId == "wuseeds") {
        } else if (button.customId == "wugrowing") {
        } else {
        }
        if (update) {
            weedmenu[button.user.id].edit({
                embeds: [(await weedembedrenderer(button.user)) || {}],
            });
        }
        if (updateupgrades) {
            const [seedslimit, growinglimit, storagelimit] = await Promise.all([
                account.weed.limits.seeds(),
                account.weed.limits.growing(),
                account.weed.limits.storage(),
            ]);
            weedupgradesmenu[button.user.id].edit({
                embeds: [
                    new Discord.EmbedBuilder()
                        .setTitle("UPGRADES")
                        .addFields([
                            {
                                name: "SEED LIMIT",
                                value: `$${numberWithCommas(
                                    seedslimit * 3
                                )} to get ${numberWithCommas(seedslimit * 2)}`,
                            },
                            {
                                name: "GROWING LIMIT",
                                value: `$${numberWithCommas(
                                    growinglimit * 3
                                )} to get ${numberWithCommas(
                                    growinglimit * 2
                                )}`,
                            },
                            {
                                name: "STORAGE LIMIT",
                                value: `$${numberWithCommas(
                                    storagelimit * 3
                                )} to get ${numberWithCommas(
                                    storagelimit * 2
                                )}`,
                            },
                        ])
                        .setThumbnail(
                            "https://github.com/Ugric/lamar-bot-js/blob/main/images/weed.png?raw=true&nocache=1"
                        )
                        .setImage(
                            "https://github.com/Ugric/lamar-bot-js/blob/main/images/smoke%20on%20the%20water.png?raw=true"
                        )
                        .setColor("#047000"),
                ],
            });
        }
    }
};

const weedembedrenderer = async (author: Discord.User) => {
    const account = await get_account(author);
    if (!account) return;
    const [
        money,
        seeds,
        growingnum,
        storage,
        seedslimit,
        growinglimit,
        storagelimit,
    ] = await Promise.all([
        account.money(),
        account.weed.count.seeds(),
        account.weed.count.growing(),
        account.weed.count.storage(),
        account.weed.limits.seeds(),
        account.weed.limits.growing(),
        account.weed.limits.storage(),
    ]);

    return new Discord.EmbedBuilder()
        .setAuthor({
            name: author.tag,
            iconURL: author.avatarURL() || undefined,
        })
        .setTitle("WEED FARM")
        .addFields([
            {
                name: "CASH",
                value: `$${numberWithCommas(money)}`,
            },
            {
                name: "SEEDS",
                value: `${numberWithCommas(seeds)} / ${numberWithCommas(
                    seedslimit
                )} ${Math.floor((seeds / seedslimit) * 100)}%`,
            },
            {
                name: "GROWING",
                value: `${numberWithCommas(growingnum)} / ${numberWithCommas(
                    growinglimit
                )} ${Math.floor((growingnum / growinglimit) * 100)}%`,
            },
            {
                name: "STORAGE",
                value: `${numberWithCommas(storage)} / ${numberWithCommas(
                    storagelimit
                )} ${Math.floor((storage / storagelimit) * 100)}%`,
            },
        ])
        .setThumbnail(
            "https://github.com/Ugric/lamar-bot-js/blob/main/images/weed.png?raw=true&nocache=1"
        )
        .setImage(
            "https://github.com/Ugric/lamar-bot-js/blob/main/images/lamar%20weed%20farm.jpg?raw=true"
        )
        .setDescription(`buy and sell weed with the controls at the bottom!`)
        .setColor("#047000");
};

const weedstart: commandFunctionType = async ({ message }) => {
    const account = await get_account(message.user);
    if (!account || !message.channel) return;
    if (weedmenu[message.user.id]) {
        weedmenu[message.user.id].delete().catch(() => {});
        weedupgradesmenu[message.user.id].delete().catch(() => {});
    }
    message.reply({
        content: "opening weed farm...",
        ephemeral: true,
    })
    weedmenu[message.user.id] = await message.channel.send({
        embeds: [(await weedembedrenderer(message.user)) || {}],
        components: [
            new Discord.ActionRowBuilder().addComponents(
                new Discord.ButtonBuilder()
                    .setStyle(Discord.ButtonStyle.Primary)
                    .setCustomId("wbuymax")
                    .setLabel("💵 buy max seeds"),
                new Discord.ButtonBuilder()
                    .setStyle(Discord.ButtonStyle.Primary)
                    .setCustomId("wplant")
                    .setLabel("🌱 plant seeds"),
                new Discord.ButtonBuilder()
                    .setStyle(Discord.ButtonStyle.Primary)
                    .setCustomId("wpick")
                    .setLabel("✂ pick grown"),
                new Discord.ButtonBuilder()
                    .setStyle(Discord.ButtonStyle.Primary)
                    .setCustomId("wsellall")
                    .setLabel("💸 sell all storage")
            ) as unknown as Discord.ActionRow<any>,
        ],
    });
    const [seedslimit, growinglimit, storagelimit] = await Promise.all([
        account.weed.limits.seeds(),
        account.weed.limits.growing(),
        account.weed.limits.storage(),
    ]);
    weedupgradesmenu[message.user.id] = await message.channel.send({
        embeds: [
            new Discord.EmbedBuilder()
                .setTitle("UPGRADES")
                .addFields([
                    {
                        name: "SEED LIMIT",
                        value: `$${numberWithCommas(
                            seedslimit * 3
                        )} to get ${numberWithCommas(seedslimit * 2)}`,
                    },
                    {
                        name: "GROWING LIMIT",
                        value: `$${numberWithCommas(
                            growinglimit * 3
                        )} to get ${numberWithCommas(growinglimit * 2)}`,
                    },
                    {
                        name: "STORAGE LIMIT",
                        value: `$${numberWithCommas(
                            storagelimit * 3
                        )} to get ${numberWithCommas(storagelimit * 2)}`,
                    },
                ])
                .setThumbnail(
                    "https://github.com/Ugric/lamar-bot-js/blob/main/images/weed.png?raw=true&nocache=1"
                )
                .setColor("#047000")
                .setImage(
                    "https://github.com/Ugric/lamar-bot-js/blob/main/images/smoke%20on%20the%20water.png?raw=true"
                ),
        ],
        components: [
            new Discord.ActionRowBuilder().addComponents(
                new Discord.ButtonBuilder()
                    .setStyle(Discord.ButtonStyle.Primary)
                    .setCustomId("wuseeds")
                    .setLabel("UPGRADE SEEDS"),
                new Discord.ButtonBuilder()
                    .setStyle(Discord.ButtonStyle.Primary)
                    .setCustomId("wugrowing")
                    .setLabel("UPGRADE GROWING"),
                new Discord.ButtonBuilder()
                    .setStyle(Discord.ButtonStyle.Primary)
                    .setCustomId("wustorage")
                    .setLabel("UPGRADE STORAGE")
            ) as unknown as Discord.ActionRow<any>,
        ],
    });
    referencetouser[weedmenu[message.user.id].id] = message.user.id;
    referencetouser[weedupgradesmenu[message.user.id].id] = message.user.id;
};
export { buttoncontrols, weedmenu, weedstart };
export { weedButtonIDs };
