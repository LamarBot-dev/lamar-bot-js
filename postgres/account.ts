import { sql } from "slonik";
import getDatabase from ".";
import { Discord } from "../discordclient";
import Randomstring from "randomstring";

export async function init_account(user: Discord.User) {
    const pool = await getDatabase();

    console.log("Creating new user:", user.id);
    await Promise.all([
        pool.query(sql`
            INSERT INTO accounts (id, created_at)
            VALUES (${user.id}, ${Date.now()});
        `),
        pool.query(sql`INSERT INTO transactions (id, account_id, amount, reference, created_at)
            VALUES (${Randomstring.generate()}, ${
            user.id
        }, 10, ${"Lamar Davis - get started homie"}, ${Date.now()});`),
    ]);
    console.log("New user created:", user.id);
}

type account = {
    id: string;
    money: () => Promise<number>;
    weed: {
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
    lifeinvader: {
        follow: (id: string) => Promise<void>;
        unfollow: (id: string) => Promise<void>;
        followers: () => Promise<string[]>;
        following: () => Promise<string[]>;
    };
};

export async function get_account(userID: string): Promise<account | null> {
    const pool = await getDatabase();
    const account = await pool.maybeOne(sql`
        SELECT * FROM accounts WHERE id = ${userID}
    `);
    if (!account) return null;
    const accountobj: account = {
        id: userID,
        money: async () => {
            const transactions = await pool
                .oneFirst<number>(
                    sql`
                SELECT SUM(amount) FROM transactions WHERE account_id = ${userID}
            `
                )
                .catch(() => 0);
            return transactions;
        },
        weed: {
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
                const grown = await pool
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
                let topick = 0;
                const topromise: Promise<any>[] = [];
                for (const plant of grown) {
                    const grown = Math.min(
                        Math.floor((now - plant.created_at) / speed),
                        plant.amount,
                        account.weed_limits_storage -
                            account.weed_storage -
                            topick
                    );
                    if (grown <= 0) continue;
                    topick += grown;
                    topromise.push(
                        pool.query(sql`
                        UPDATE weed_growing SET
                            amount = amount - ${grown}, created_at = ${now} WHERE id = ${plant.id}
                    `)
                    );
                }
                if (topick <= 0) return 0;
                await Promise.all([
                    pool.query(sql`
                    UPDATE accounts SET
                        weed_storage = weed_storage + ${topick} WHERE id = ${userID}
                `),
                    ...topromise,
                ]);
                return topick;
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
        },
        lifeinvader: {
            followers: async () => {
                const followers = await pool
                    .manyFirst<string>(
                        sql`
                    SELECT follower_id FROM followers WHERE following_id = ${userID}
                `
                    ).catch(() => []);
                return followers as unknown as string[];
            },
            following: async () => {
                const following = await pool
                    .manyFirst<string>(
                        sql`
                    SELECT following_id FROM followers WHERE follower_id = ${userID}
                `
                    )
                    .catch(() => []);
                return following as unknown as string[];
            },
            follow: async (id: string) => {
                await pool.query(sql`
                    INSERT INTO followers (follower_id, following_id, created_at) VALUES (${userID}, ${id}, ${Date.now()})
                `);
            },
            unfollow: async (id: string) => {
                await pool.query(sql`
                    DELETE FROM followers WHERE follower_id = ${userID} AND following_id = ${id}
                `);
            }
        },
    };
    return accountobj;
}
