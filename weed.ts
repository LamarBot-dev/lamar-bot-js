import { buttonControlsFunction } from "./buttonControls";
import { commandFunctionType } from "./command-handler";
import { Discord } from "./discordclient";
const referencetouser: Record<string, string> = {};
const weedmenu: Record<string, Discord.InteractionResponse<boolean>> = {};
const weedupgradesmenu: Record<
    string,
    Discord.InteractionResponse<boolean>
> = {};

const weedButtonIDs = [
    "wbuymax",
    "wplant",
    "wpick",
    "wsellall",
    "wuseeds",
    "wugrowing",
    "wustorage",
];

type weedBusiness = {
    limits: {
        storage: number;
        growing: number;
        seeds: number;
    };
    data: {
        storage: number;
        growing: Array<{
            amount: number;
            time: number;
        }>;
        seeds: number;
    };
};

function numberWithCommas(x: number) {
    return String(x).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

const buttoncontrols: buttonControlsFunction = (button) => {
    if (button.message &&
        referencetouser[button.message.id] == button.user.id
    ) {
        const account = data.current.users[button.user.id];
        const business = account.businesses.weed;
        let update = false;
        let updateupgrades = false;
        const storageLeft = business.limits.storage - business.data.storage;
        let growingnum = 0;
        for (const grow of business.data.growing) {
            growingnum += grow.amount;
        }
        if (button.customId == "wbuymax") {
            const tobuy = business.limits.seeds - business.data.seeds;
            if (tobuy > 0 && account.money > 0) {
                if (account.money - tobuy < 0) {
                    business.data.seeds += account.money;
                    account.money = 0;
                } else {
                    business.data.seeds += tobuy;
                    account.money -= tobuy;
                }
                update = true;
            }
        } else if (button.customId == "wplant") {
            if (
                business.data.seeds > 0 &&
                growingnum < business.limits.growing
            ) {
                const maxToPlant = business.limits.growing - growingnum;
                const toPlant =
                    maxToPlant < business.data.seeds
                        ? maxToPlant
                        : business.data.seeds;

                business.data.seeds -= toPlant;
                business.data.growing.push({
                    amount: toPlant,
                    time: new Date().getTime(),
                });
                update = true;
            }
        } else if (button.customId == "wpick") {
            if (growingnum > 0 && storageLeft > 0) {
                let toAdd = 0;
                const currentTime = new Date().getTime();
                for (let i = 0; i < business.data.growing.length; i++) {
                    if (currentTime - business.data.growing[i].time >= 60000) {
                        if (
                            storageLeft -
                                toAdd -
                                business.data.growing[i].amount <
                            0
                        ) {
                            business.data.growing[i].amount = -(
                                storageLeft -
                                toAdd -
                                business.data.growing[i].amount
                            );
                            toAdd = storageLeft;
                            break;
                        } else {
                            toAdd += business.data.growing[i].amount;
                            business.data.growing = [
                                ...business.data.growing.slice(0, i),
                                ...business.data.growing.slice(i + 1),
                            ];
                        }
                    }
                }
                business.data.growing = business.data.growing.filter(function (
                    el: any
                ) {
                    return el != null;
                });
                business.data.storage += toAdd;
                update = true;
            }
        } else if (button.customId == "wsellall") {
            if (business.data.storage > 0) {
                account.money += business.data.storage * 10;
                business.data.storage = 0;
                update = true;
            }
        } else if (button.customId == "wuseeds") {
            if (account.money - business.limits.seeds * 3 > 0) {
                account.money -= business.limits.seeds * 3;
                business.limits.seeds *= 2;
                updateupgrades = true;
                update = true;
            }
        } else if (button.customId == "wugrowing") {
            if (account.money - business.limits.growing * 3 > 0) {
                account.money -= business.limits.growing * 3;
                business.limits.growing *= 2;
                updateupgrades = true;
                update = true;
            }
        } else {
            if (account.money - business.limits.storage * 3 > 0) {
                account.money -= business.limits.storage * 3;
                business.limits.storage *= 2;
                updateupgrades = true;
                update = true;
            }
        }
        if (update) {
            weedmenu[button.user.id].edit({
                embeds: [weedembedrenderer(button.user, business)],
            });
        }
        if (updateupgrades) {
            weedupgradesmenu[button.user.id].edit({
                embeds: [
                    new Discord.EmbedBuilder()
                        .setTitle("UPGRADES")
                        .addFields([
                            {
                                name: "SEED LIMIT",
                                value: `$${numberWithCommas(
                                    business.limits.seeds * 3
                                )} to get ${numberWithCommas(
                                    business.limits.seeds * 2
                                )}`,
                            },
                            {
                                name: "GROWING LIMIT",
                                value: `$${numberWithCommas(
                                    business.limits.growing * 3
                                )} to get ${numberWithCommas(
                                    business.limits.growing * 2
                                )}`,
                            },
                            {
                                name: "STORAGE LIMIT",
                                value: `$${numberWithCommas(
                                    business.limits.storage * 3
                                )} to get ${numberWithCommas(
                                    business.limits.storage * 2
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

const weedembedrenderer = (author: Discord.User, weed: weedBusiness) => {
    let growingnum = 0;
    for (const grow of weed.data.growing) {
        growingnum += grow.amount;
    }
    return new Discord.EmbedBuilder()
        .setAuthor({
            name: author.tag,
            iconURL: author.avatarURL() || undefined,
        })
        .setTitle("WEED FARM")
        .addFields([
            {
                name: "CASH",
                value: `$${numberWithCommas(
                    data.current.users[author.id].money
                )}`,
            },
            {
                name: "SEEDS",
                value: `${numberWithCommas(
                    weed.data.seeds
                )} / ${numberWithCommas(weed.limits.seeds)} ${Math.floor(
                    (weed.data.seeds / weed.limits.seeds) * 100
                )}%`,
            },
            {
                name: "GROWING",
                value: `${numberWithCommas(growingnum)} / ${numberWithCommas(
                    weed.limits.growing
                )} ${Math.floor((growingnum / weed.limits.growing) * 100)}%`,
            },
            {
                name: "STORAGE",
                value: `${numberWithCommas(
                    weed.data.storage
                )} / ${numberWithCommas(weed.limits.storage)} ${Math.floor(
                    (weed.data.storage / weed.limits.storage) * 100
                )}%`,
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
    if (weedmenu[message.user.id]) {
        weedmenu[message.user.id].delete().catch(() => {});
        weedupgradesmenu[message.user.id].delete().catch(() => {});
    }
    weedmenu[message.user.id] = await message.reply({
        embeds: [
            weedembedrenderer(
                message.user,
                data.current.users[message.user.id].businesses.weed
            ),
        ],
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
    weedupgradesmenu[message.user.id] = await message.reply({
        embeds: [
            new Discord.EmbedBuilder()
                .setTitle("UPGRADES")
                .addFields([
                    {
                        name: "SEED LIMIT",
                        value: `$${numberWithCommas(
                            data.current.users[message.user.id].businesses.weed
                                .limits.seeds * 3
                        )} to get ${numberWithCommas(
                            data.current.users[message.user.id].businesses.weed
                                .limits.seeds * 2
                        )}`,
                    },
                    {
                        name: "GROWING LIMIT",
                        value: `$${numberWithCommas(
                            data.current.users[message.user.id].businesses.weed
                                .limits.growing * 3
                        )} to get ${numberWithCommas(
                            data.current.users[message.user.id].businesses.weed
                                .limits.growing * 2
                        )}`,
                    },
                    {
                        name: "STORAGE LIMIT",
                        value: `$${numberWithCommas(
                            data.current.users[message.user.id].businesses.weed
                                .limits.storage * 3
                        )} to get ${numberWithCommas(
                            data.current.users[message.user.id].businesses.weed
                                .limits.storage * 2
                        )}`,
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
export type { weedBusiness };
