import { buttonControlsFunction } from "../buttonControls";
import { commandFunctionType } from "../command-handler";
import { Discord } from "../discordclient";
import { get_account } from "../postgres/account";
import get_weed_farm from "./calculate";
import { upgradeembedrenderer, weedembedrenderer } from "./gui";

const referencetouser: Record<string, string> = {};
const weedmenu: Record<string, Discord.Message<boolean>> = {};
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

const buttoncontrols: buttonControlsFunction = async (button) => {
    if (
        button.message &&
        referencetouser[button.message.id] == button.user.id
    ) {
        const account = await get_account(button.user.id);
        const weed = await get_weed_farm(button.user.id);
        if (!account || !weed) return {};
        let update = false;
        let updateupgrades = false;
        switch (button.customId) {
            case "wbuymax":
                if (await weed.buy_seeds()) update = true;
                break;
            case "wplant":
                if (await weed.plant()) update = true;
                break;
            case "wpick":
                if (await weed.pick()) update = true;
                break;
            case "wsellall":
                if (await weed.sell()) update = true;
                break;
            case "wuseeds":
                if (await weed.upgrades.seeds()) updateupgrades = true;
                break;
            case "wugrowing":
                if (await weed.upgrades.growing()) updateupgrades = true;
                break;
            case "wustorage":
                if (await weed.upgrades.storage()) updateupgrades = true;
                break;
            case "wuspeed":
                if (await weed.upgrades.speed()) updateupgrades = true;
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

async function closeFarm(userID: string) {
    if (weedupgradesmenu[userID]) {
        await weedupgradesmenu[userID].delete().catch(console.error);
        delete weedupgradesmenu[userID];
    }
    if (weedmenu[userID]) {
        await weedmenu[userID].delete().catch(console.error);
        delete weedmenu[userID];
    }
}

const weedstart: commandFunctionType = async (message) => {
    const account = await get_account(message.user.id);
    await message.deferReply();
    if (!account || !message.channel) return;
    await closeFarm(message.user.id);
    weedmenu[message.user.id] = await message.editReply({
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
    weedupgradesmenu[message.user.id] = await message.followUp({
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
export { buttoncontrols, weedmenu, weedstart, closeFarm };
export { weedButtonIDs };
