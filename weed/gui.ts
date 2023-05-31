import humanizeDuration from "humanize-duration";
import { Discord } from "../discordclient";
import { get_account } from "../postgres/account";
import get_weed_farm from "./calculate";
import { numberWithCommas } from "../money/money";


const upgradeembedrenderer = async (author: Discord.User) => {
    const account = await get_account(author.id);
    const weed = await get_weed_farm(author.id);
    if (!account || !weed) return {};
    const [seedslimit, growinglimit, storagelimit, speedlimit] =
        await Promise.all([
            weed.limits.seeds(),
            weed.limits.growing(),
            weed.limits.storage(),
            weed.limits.speed(),
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
                    speedlimit ** 2 * 100
                )} to get ${Number(
                    (newspeed / 1000).toPrecision(3)
                )}s per seed`,
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
    const weed = await get_weed_farm(author.id);
    if (!account || !weed) return {};
    const [
        money,
        seeds,
        growingnum,
        storage,
        seedslimit,
        growinglimit,
        storagelimit,
        speedlimit,
    ] = await Promise.all([
        account.money.balance(),
        weed.count.seeds(),
        weed.count.growing(),
        weed.count.storage(),
        weed.limits.seeds(),
        weed.limits.growing(),
        weed.limits.storage(),
        weed.limits.speed(),
    ]);

    const timePerSeed = 10000 * (1 / speedlimit);
    const timeToGrow = timePerSeed * growingnum;

    const time = humanizeDuration(timeToGrow, { round: true, largest: 2 });

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
                name: "SPEED",
                value: `${Number(
                    (timePerSeed / 1000).toPrecision(3)
                )}s per seed`,
            },
            {
                name: "TIME TO GROW",
                value: `${time}`,
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

export {
    upgradeembedrenderer,
    weedembedrenderer,
}