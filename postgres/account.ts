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
};

export async function get_account(user: Discord.User): Promise<account | null> {
    const pool = await getDatabase();
    const account = await pool.maybeOne(sql`
        SELECT * FROM accounts WHERE id = ${user.id}
    `);
    if (!account) return null;
    const accountobj: account = {
        id: user.id,
        money: async () => {
            const transactions = await pool.oneFirst<number>(sql`
                SELECT SUM(amount) FROM transactions WHERE account_id = ${user.id}
            `);
            return transactions;
        },
        weed: {
            count: {
                seeds: async () => {
                    const seeds = await pool.oneFirst<number>(sql`
                    SELECT weed_seeds FROM accounts WHERE id = ${user.id}
                `);
                    return seeds;
                },
                growing: async () => {
                    const growing = await pool.oneFirst<number>(sql`
                    SELECT SUM(amount) FROM weed_growing WHERE account_id = ${user.id} AND amount > 0
                `);
                    return growing || 0;
                },
                storage: async () => {
                    const storage = await pool.oneFirst<number>(sql`
                    SELECT weed_storage FROM accounts WHERE id = ${user.id}
                `);
                    return storage;
                },
            },
            limits: {
                speed: async () => {
                    const speed = await pool.oneFirst<number>(sql`
                    SELECT weed_grow_speed_upgrade FROM accounts WHERE id = ${user.id}
                `);
                    return speed;
                },
                seeds: async () => {
                    const seeds = await pool.oneFirst<number>(sql`
                    SELECT weed_limits_seeds FROM accounts WHERE id = ${user.id}
                `);
                    return seeds;
                },
                growing: async () => {
                    const growing = await pool.oneFirst<number>(sql`
                    SELECT weed_limits_growing FROM accounts WHERE id = ${user.id}
                `);
                    return growing;
                },
                storage: async () => {
                    const storage = await pool.oneFirst<number>(sql`
                    SELECT weed_limits_storage FROM accounts WHERE id = ${user.id}
                `);
                    return storage;
                },
            },
            upgrades: {
                speed: async () => {
                    const speed_upgrade = await pool.oneFirst<number>(sql`
                    SELECT weed_grow_speed_upgrade FROM accounts WHERE id = ${user.id}
                    `);
                    const cost = (speed_upgrade ** 2) * 100;
                    const balance = await accountobj.money();
                    console.log(balance, cost)
                    if (balance >= cost) {
                        await Promise.all([
                            pool.query(sql`
                            UPDATE accounts SET
                                weed_grow_speed_upgrade = weed_grow_speed_upgrade + 1 WHERE id = ${user.id}
                        `),
                            pool.query(sql`
                            INSERT INTO transactions (id, account_id, amount, reference, created_at)
                            VALUES (${Randomstring.generate()}, ${
                                user.id
                            }, ${-cost}, ${"upgrade speed"}, ${Date.now()});
                            `),
                        ]);
                        return true;
                    }
                    return false;
                },
                seeds: async () => {
                    const seeds = await pool.oneFirst<number>(sql`
                    SELECT weed_limits_seeds FROM accounts WHERE id = ${user.id}
                `);
                    const cost = seeds * 3;
                    const balance = await accountobj.money();
                    if (balance >= cost) {
                        await Promise.all([
                            pool.query(sql`
                            UPDATE accounts SET
                                weed_limits_seeds = (weed_limits_seeds*2) WHERE id = ${user.id}
                        `),
                            pool.query(sql`
                            INSERT INTO transactions (id, account_id, amount, reference, created_at)
                            VALUES (${Randomstring.generate()}, ${
                                user.id
                            }, ${-cost}, ${"upgrade seeds"}, ${Date.now()});
                            `),
                        ]);
                        return true;
                    }
                    return false;
                },
                growing: async () => {
                    const growing = await pool.oneFirst<number>(sql`
                    SELECT weed_limits_growing FROM accounts WHERE id = ${user.id}
                `);
                    const cost = growing * 3;
                    const balance = await accountobj.money();
                    if (balance >= cost) {
                        await Promise.all([
                            pool.query(sql`
                            UPDATE accounts SET
                                weed_limits_growing = (weed_limits_growing*2) WHERE id = ${user.id}
                        `),
                            pool.query(sql`
                            INSERT INTO transactions (id, account_id, amount, reference, created_at)
                            VALUES (${Randomstring.generate()}, ${
                                user.id
                            }, ${-cost}, ${"upgrade growing"}, ${Date.now()});
                            `),
                        ]);
                        return true;
                    }
                    return false;
                },
                storage: async () => {
                    const storage = await pool.oneFirst<number>(sql`
                    SELECT weed_limits_storage FROM accounts WHERE id = ${user.id}
                `);
                    const cost = storage * 3;
                    const balance = await accountobj.money();
                    if (balance >= cost) {
                        await Promise.all([
                            pool.query(sql`
                            UPDATE accounts SET
                                weed_limits_storage = (weed_limits_storage*2) WHERE id = ${user.id}
                        `),
                            pool.query(sql`
                            INSERT INTO transactions (id, account_id, amount, reference, created_at)
                            VALUES (${Randomstring.generate()}, ${
                                user.id
                            }, ${-cost}, ${"upgrade storage"}, ${Date.now()});
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
                    SELECT weed_seeds, weed_storage, weed_limits_seeds, weed_limits_growing, weed_limits_storage FROM accounts WHERE id = ${user.id} LIMIT 1
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
                        weed_seeds = weed_seeds + ${tobuy} WHERE id = ${user.id}
                `),
                    pool.query(sql`
                    INSERT INTO transactions (id, account_id, amount, reference, created_at)
                    VALUES (${Randomstring.generate()}, ${
                        user.id
                    }, ${-tobuy}, ${"buy seeds"}, ${Date.now()});
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
                    SELECT weed_seeds, weed_storage, weed_limits_seeds, weed_limits_growing, weed_limits_storage FROM accounts WHERE id = ${user.id} LIMIT 1
                `);
                if (!account) return 0;
                const growing = await pool.oneFirst<number>(sql`
                    SELECT SUM(amount) FROM weed_growing WHERE account_id = ${user.id} AND amount > 0
                `);
                if (growing >= account.weed_limits_storage) return 0;
                const toplant = Math.min(
                    account.weed_seeds,
                    account.weed_limits_growing - growing
                );
                if (toplant <= 0) return 0;

                await Promise.all([
                    pool.query(sql`
                    UPDATE accounts SET
                        weed_seeds = weed_seeds - ${toplant} WHERE id = ${user.id}
                `),
                    await pool.query(sql`
                    INSERT INTO weed_growing (id, account_id, amount, created_at)
                    VALUES (${Randomstring.generate()}, ${
                        user.id
                    }, ${toplant}, ${Date.now()});
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
                    SELECT weed_seeds, weed_storage, weed_grow_speed_upgrade, weed_limits_seeds, weed_limits_storage FROM accounts WHERE id = ${user.id} LIMIT 1
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
                    SELECT id, amount, created_at FROM weed_growing WHERE account_id = ${user.id} AND amount > 0
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
                        weed_storage = weed_storage + ${topick} WHERE id = ${user.id}
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
                    SELECT weed_seeds, weed_storage, weed_limits_seeds, weed_limits_storage FROM accounts WHERE id = ${user.id} LIMIT 1
                `);
                if (!account) return 0;
                const tosell = account.weed_storage;
                if (tosell <= 0) return 0;
                await Promise.all([
                    pool.query(sql`
                    UPDATE accounts SET
                        weed_storage = weed_storage - ${tosell} WHERE id = ${user.id}
                `),
                    pool.query(sql`
                    INSERT INTO transactions (id, account_id, amount, reference, created_at)
                    VALUES (${Randomstring.generate()}, ${user.id}, ${
                        tosell * 10
                    }, ${"sell product"}, ${Date.now()});
                    `),
                ]);
                return tosell;
            },
        },
    };
    return accountobj;
}
