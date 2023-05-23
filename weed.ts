import { sql } from "slonik";
import { buttonControlsFunction } from "./buttonControls";
import { commandFunctionType } from "./command-handler";
import { Discord } from "./discordclient";
import { get_account } from "./postgres/account";
import getDatabase from "./postgres";
import Randomstring from "randomstring";
import humanizeDuration from "humanize-duration";

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

function numberWithCommas(x: number) {
    return String(x).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

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
        account.money(),
        weed.count.seeds(),
        weed.count.growing(),
        weed.count.storage(),
        weed.limits.seeds(),
        weed.limits.growing(),
        weed.limits.storage(),
        weed.limits.speed(),
    ]);

    const timePerSeed = (10000 * (1 / (speedlimit)))
    const timeToGrow = timePerSeed * growingnum;

    const time = humanizeDuration(timeToGrow, { round: true,
        largest: 2 });

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

type weedFarm = {
    buy_seeds: () => Promise<number>;
    plant: () => Promise<number>;
    pick: () => Promise<number>;
    sell: () => Promise<number>;
    count: {
        seeds: () => Promise<number>;
        growing: () => Promise<number>;
        storage: () => Promise<number>;
    };
    limits: {
        speed: () => Promise<number>;
        seeds: () => Promise<number>;
        growing: () => Promise<number>;
        storage: () => Promise<number>;
    };
    upgrades: {
        speed: () => Promise<boolean>;
        seeds: () => Promise<boolean>;
        growing: () => Promise<boolean>;
        storage: () => Promise<boolean>;
    };
};

async function get_weed_farm(userID: string): Promise<weedFarm> {
    const pool = await getDatabase();
    const accountobj = await get_account(userID);
    if (!accountobj) throw new Error("account not found");
    return {
        count: {
            seeds: async () => {
                const seeds = await pool.oneFirst<number>(
                    sql`
                    SELECT weed_seeds FROM accounts WHERE id = ${userID}
                `
                );
                return seeds;
            },
            growing: async () => {
                const growing = await pool
                    .oneFirst<number>(
                        sql`
                    SELECT SUM(amount) FROM weed_growing WHERE account_id = ${userID} AND amount > 0
                `
                    )
                    .catch(() => 0);
                return growing || 0;
            },
            storage: async () => {
                const storage = await pool.oneFirst<number>(sql`
                    SELECT weed_storage FROM accounts WHERE id = ${userID}
                `);
                return storage;
            },
        },
        limits: {
            speed: async () => {
                const speed = await pool.oneFirst<number>(sql`
                    SELECT weed_grow_speed_upgrade FROM accounts WHERE id = ${userID}
                `);
                return speed;
            },
            seeds: async () => {
                const seeds = await pool.oneFirst<number>(sql`
                    SELECT weed_limits_seeds FROM accounts WHERE id = ${userID}
                `);
                return seeds;
            },
            growing: async () => {
                const growing = await pool.oneFirst<number>(sql`
                    SELECT weed_limits_growing FROM accounts WHERE id = ${userID}
                `);
                return growing;
            },
            storage: async () => {
                const storage = await pool.oneFirst<number>(sql`
                    SELECT weed_limits_storage FROM accounts WHERE id = ${userID}
                `);
                return storage;
            },
        },
        upgrades: {
            speed: async () => {
                const speed_upgrade = await pool.oneFirst<number>(sql`
                    SELECT weed_grow_speed_upgrade FROM accounts WHERE id = ${userID}
                    `);
                const cost = speed_upgrade ** 2 * 100;
                const balance = await accountobj.money();
                if (balance >= cost) {
                    await Promise.all([
                        pool.query(sql`
                            UPDATE accounts SET
                                weed_grow_speed_upgrade = weed_grow_speed_upgrade + 1 WHERE id = ${userID}
                        `),
                        pool.query(sql`
                            INSERT INTO transactions (id, account_id, amount, reference, created_at)
                            VALUES (${Randomstring.generate()}, ${userID}, ${-cost}, ${"upgrade speed"}, ${Date.now()});
                            `),
                    ]);
                    return true;
                }
                return false;
            },
            seeds: async () => {
                const seeds = await pool.oneFirst<number>(sql`
                    SELECT weed_limits_seeds FROM accounts WHERE id = ${userID}
                `);
                const cost = seeds * 3;
                const balance = await accountobj.money();
                if (balance >= cost) {
                    await Promise.all([
                        pool.query(sql`
                            UPDATE accounts SET
                                weed_limits_seeds = (weed_limits_seeds*2) WHERE id = ${userID}
                        `),
                        pool.query(sql`
                            INSERT INTO transactions (id, account_id, amount, reference, created_at)
                            VALUES (${Randomstring.generate()}, ${userID}, ${-cost}, ${"upgrade seeds"}, ${Date.now()});
                            `),
                    ]);
                    return true;
                }
                return false;
            },
            growing: async () => {
                const growing = await pool.oneFirst<number>(sql`
                    SELECT weed_limits_growing FROM accounts WHERE id = ${userID}
                `);
                const cost = growing * 3;
                const balance = await accountobj.money();
                if (balance >= cost) {
                    await Promise.all([
                        pool.query(sql`
                            UPDATE accounts SET
                                weed_limits_growing = (weed_limits_growing*2) WHERE id = ${userID}
                        `),
                        pool.query(sql`
                            INSERT INTO transactions (id, account_id, amount, reference, created_at)
                            VALUES (${Randomstring.generate()}, ${userID}, ${-cost}, ${"upgrade growing"}, ${Date.now()});
                            `),
                    ]);
                    return true;
                }
                return false;
            },
            storage: async () => {
                const storage = await pool.oneFirst<number>(sql`
                    SELECT weed_limits_storage FROM accounts WHERE id = ${userID}
                `);
                const cost = storage * 3;
                const balance = await accountobj.money();
                if (balance >= cost) {
                    await Promise.all([
                        pool.query(sql`
                            UPDATE accounts SET
                                weed_limits_storage = (weed_limits_storage*2) WHERE id = ${userID}
                        `),
                        pool.query(sql`
                            INSERT INTO transactions (id, account_id, amount, reference, created_at)
                            VALUES (${Randomstring.generate()}, ${userID}, ${-cost}, ${"upgrade storage"}, ${Date.now()});
                            `),
                    ]);
                    return true;
                }
                return false;
            },
        },
        buy_seeds: async () => {
            const account = await pool.maybeOne<{
                weed_seeds: number;
                weed_storage: number;
                weed_limits_seeds: number;
                weed_limits_growing: number;
                weed_limits_storage: number;
            }>(sql`
                    SELECT weed_seeds, weed_storage, weed_limits_seeds, weed_limits_growing, weed_limits_storage FROM accounts WHERE id = ${userID} LIMIT 1
                `);
            if (!account) return 0;
            const balance = await accountobj.money();
            const tobuy = Math.min(
                account.weed_limits_seeds - account.weed_seeds,
                balance
            );
            if (tobuy <= 0) return 0;
            await Promise.all([
                pool.query(sql`
                    UPDATE accounts SET
                        weed_seeds = weed_seeds + ${tobuy} WHERE id = ${userID}
                `),
                pool.query(sql`
                    INSERT INTO transactions (id, account_id, amount, reference, created_at)
                    VALUES (${Randomstring.generate()}, ${userID}, ${-tobuy}, ${"buy seeds"}, ${Date.now()});
                    `),
            ]);
            return tobuy;
        },
        plant: async () => {
            const account = await pool.maybeOne<{
                weed_seeds: number;
                weed_storage: number;
                weed_limits_seeds: number;
                weed_limits_growing: number;
                weed_limits_storage: number;
            }>(sql`
                    SELECT weed_seeds, weed_storage, weed_limits_seeds, weed_limits_growing, weed_limits_storage FROM accounts WHERE id = ${userID} LIMIT 1
                `);
            if (!account) return 0;
            const growing = await pool.oneFirst<number>(sql`
                    SELECT SUM(amount) FROM weed_growing WHERE account_id = ${userID} AND amount > 0
                `);
            const toplant = Math.min(
                account.weed_seeds,
                account.weed_limits_growing - growing
            );
            if (toplant <= 0) return 0;

            await Promise.all([
                pool.query(sql`
                    UPDATE accounts SET
                        weed_seeds = weed_seeds - ${toplant} WHERE id = ${userID}
                `),
                await pool.query(sql`
                    INSERT INTO weed_growing (id, account_id, amount, created_at)
                    VALUES (${Randomstring.generate()}, ${userID}, ${toplant}, ${Date.now()});
                `),
            ]);
            return toplant;
        },
        pick: async () => {
            const account = await pool.maybeOne<{
                weed_seeds: number;
                weed_storage: number;
                weed_grow_speed_upgrade: number;
                weed_limits_seeds: number;
                weed_limits_storage: number;
            }>(sql`
                    SELECT weed_seeds, weed_storage, weed_grow_speed_upgrade, weed_limits_seeds, weed_limits_storage FROM accounts WHERE id = ${userID} LIMIT 1
                `);
            const now = Date.now();
            if (!account) return 0;
            const growing = await pool
                .many<{
                    id: string;
                    amount: number;
                    created_at: number;
                }>(
                    sql`
                    SELECT id, amount, created_at FROM weed_growing WHERE account_id = ${userID} AND amount > 0
                `
                )
                .catch(() => []);
            const speed = 10000 * (1 / account.weed_grow_speed_upgrade);
            let picked = 0;
            const topromise: Promise<any>[] = [];
            for (const plant of growing) {
                const grown = Math.min(
                    Math.floor((now - plant.created_at) / speed),
                    plant.amount,
                    account.weed_limits_storage - account.weed_storage - picked
                )
                picked += grown;
                topromise.push(
                    pool.query(sql`
                        UPDATE weed_growing SET
                            amount = amount - ${grown}, created_at = created_at + ${Math.round(grown*speed)} WHERE id = ${plant.id}
                    `)
                );
                if (grown != plant.amount) break;
            }
            console.log(picked);
            if (picked <= 0) return 0;
            await Promise.all([
                pool.query(sql`
                    UPDATE accounts SET
                        weed_storage = weed_storage + ${picked} WHERE id = ${userID}
                `),
                ...topromise,
            ]);
            return picked;
        },
        sell: async () => {
            const account = await pool.maybeOne<{
                weed_seeds: number;
                weed_storage: number;
                weed_limits_seeds: number;
                weed_limits_storage: number;
            }>(sql`
                    SELECT weed_seeds, weed_storage, weed_limits_seeds, weed_limits_storage FROM accounts WHERE id = ${userID} LIMIT 1
                `);
            if (!account) return 0;
            const tosell = account.weed_storage;
            if (tosell <= 0) return 0;
            await Promise.all([
                pool.query(sql`
                    UPDATE accounts SET
                        weed_storage = weed_storage - ${tosell} WHERE id = ${userID}
                `),
                pool.query(sql`
                    INSERT INTO transactions (id, account_id, amount, reference, created_at)
                    VALUES (${Randomstring.generate()}, ${userID}, ${
                    tosell * 10
                }, ${"sell product"}, ${Date.now()});
                    `),
            ]);
            return tosell;
        },
    };
}

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
