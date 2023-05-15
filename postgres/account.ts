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
            seeds: () => Promise<number>;
            growing: () => Promise<number>;
            storage: () => Promise<number>;
        };
    };
};

const growntime = 60000;

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
                    SELECT SUM(amount) FROM weed_growing WHERE account_id = ${user.id} AND picked = false
                `);
                    return growing;
                },
                storage: async () => {
                    const storage = await pool.oneFirst<number>(sql`
                    SELECT weed_storage FROM accounts WHERE id = ${user.id}
                `);
                    return storage;
                },
            },
            limits: {
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
                    SELECT SUM(amount) FROM weed_growing WHERE account_id = ${user.id} AND picked = false
                `);
                if (growing >= account.weed_limits_storage) return 0;
                const toplant = Math.min(
                    account.weed_seeds,
                    account.weed_limits_storage - growing
                );
                if (toplant <= 0) return 0;

                await Promise.all([
                    pool.query(sql`
                    UPDATE accounts SET
                        weed_seeds = weed_seeds - ${toplant} WHERE id = ${user.id}
                `),
                    await pool.query(sql`
                    INSERT INTO weed_growing (id, account_id, amount, picked, created_at)
                    VALUES (${Randomstring.generate()}, ${
                        user.id
                    }, ${toplant}, false, ${Date.now()});
                `),
                ]);
                return toplant;
            },
            pick: async () => {
                const account = await pool.maybeOne<{
                    weed_seeds: number;
                    weed_storage: number;
                    weed_limits_seeds: number;
                    weed_limits_storage: number;
                }>(sql`
                    SELECT weed_seeds, weed_storage, weed_limits_seeds, weed_limits_storage FROM accounts WHERE id = ${user.id} LIMIT 1
                `);
                if (!account) return 0;
                const time = Date.now() - growntime;
                const grown = await pool.oneFirst<number>(sql`
                    SELECT SUM(amount) as total FROM weed_growing WHERE account_id = ${user.id} AND picked = false AND created_at < ${time}
                `);
                if (grown <= 0) return 0;
                await Promise.all([
                    pool.query(sql`
                    UPDATE accounts SET
                        weed_storage = weed_storage + ${grown} WHERE id = ${user.id}
                `),
                    pool.query(sql`
                    UPDATE weed_growing SET
                        picked = true WHERE account_id = ${user.id} AND picked = false AND created_at < ${time}
                `),
                ]);
                return grown;
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
