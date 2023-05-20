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
    "wuspeed",
];

function numberWithCommas(x: number) {
    return String(x).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

const buttoncontrols: buttonControlsFunction = async (button) => {
    if (
        button.message &&
        referencetouser[button.message.id] == button.user.id
    ) {
        const account = await get_account(button.user.id);
        if (!account) return;
        let update = false;
        let updateupgrades = false;
        switch (button.customId) {
            case "wbuymax":
                if (await account.weed.buy_seeds()) update = true;
                break;
            case "wplant":
                if (await account.weed.plant()) update = true;
                break;
            case "wpick":
                if (await account.weed.pick()) update = true;
                break;
            case "wsellall":
                if (await account.weed.sell()) update = true;
                break;
            case "wuseeds":
                if (await account.weed.upgrades.seeds()) updateupgrades = true;
                break;
            case "wugrowing":
                if (await account.weed.upgrades.growing())
                    updateupgrades = true;
                break;
            case "wustorage":
                if (await account.weed.upgrades.storage())
                    updateupgrades = true;
                break;
            case "wuspeed":
                if (await account.weed.upgrades.speed()) updateupgrades = true;
                break;
        }
        if (update || updateupgrades) {
            weedmenu[button.user.id].edit({
                embeds: [await weedembedrenderer(button.user)],
            });
        }
        if (updateupgrades) {
            weedupgradesmenu[button.user.id].edit({
                embeds: [await upgradeembedrenderer(button.user)],
            });
        }
    }
};

const upgradeembedrenderer = async (author: Discord.User) => {
    const account = await get_account(author.id);
    if (!account) return {};
    const [seedslimit, growinglimit, storagelimit, speedlimit] =
        await Promise.all([
            account.weed.limits.seeds(),
            account.weed.limits.growing(),
            account.weed.limits.storage(),
            account.weed.limits.speed(),
        ]);
    const newspeed = 10000 * (1 / (speedlimit + 1));
    return new Discord.EmbedBuilder()
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
            {
                name: "GROWING SPEED",
                value: `$${numberWithCommas(
                    (speedlimit ** 2) * 100
                )} to get ${Number((newspeed / 1000).toFixed(2))}s per seed`,
            },
        ])
        .setThumbnail(
            "https://github.com/Ugric/lamar-bot-js/blob/main/images/weed.png?raw=true&nocache=1"
        )
        .setColor("#047000")
        .setImage(
            "https://github.com/Ugric/lamar-bot-js/blob/main/images/smoke%20on%20the%20water.png?raw=true"
        );
};

const weedembedrenderer = async (author: Discord.User) => {
    const account = await get_account(author.id);
    if (!account) return {};
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

const weedstart: commandFunctionType = async (message) => {
    const account = await get_account(message.user.id);
    if (!account || !message.channel) return;
    if (weedmenu[message.user.id]) {
        weedmenu[message.user.id].delete().catch(() => {});
        weedupgradesmenu[message.user.id].delete().catch(() => {});
    }
    message.reply({
        content: "opening weed farm...",
        ephemeral: true,
    });
    weedmenu[message.user.id] = await message.channel.send({
        embeds: [await weedembedrenderer(message.user)],
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
    weedupgradesmenu[message.user.id] = await message.channel.send({
        embeds: [await upgradeembedrenderer(message.user)],
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
                    .setLabel("UPGRADE STORAGE"),
                new Discord.ButtonBuilder()
                    .setStyle(Discord.ButtonStyle.Primary)
                    .setCustomId("wuspeed")
                    .setLabel("UPGRADE SPEED")
            ) as unknown as Discord.ActionRow<any>,
        ],
    });
    referencetouser[weedmenu[message.user.id].id] = message.user.id;
    referencetouser[weedupgradesmenu[message.user.id].id] = message.user.id;
};
export { buttoncontrols, weedmenu, weedstart };
export { weedButtonIDs };
