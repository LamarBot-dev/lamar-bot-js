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
    weed: {
        seeds: {
            count: () => Promise<number>;
            add: (amount: number) => Promise<void>;
        };
        growing: {
            count: () => Promise<number>;
            add: (amount: number) => Promise<void>;
        };
        grown: {
            count: () => Promise<number>;
            add: (amount: number) => Promise<void>;
        };
        storage: {
            count: () => Promise<number>;
            add: (amount: number) => Promise<void>;
        };
        limits: {
            seeds: () => Promise<number>;
            growing: () => Promise<number>;
            storage: () => Promise<number>;
        };
    };
};
export async function get_account(user: Discord.User): Promise<account|null> {
    const pool = await getDatabase();
    const account = await pool.maybeOne(sql`
        SELECT * FROM accounts WHERE id = ${user.id}
    `);
    if (!account) return null;
    const accountobj = {
        id: user.id,
        weed: {
            seeds: {
                count: async () => {
                    const result = await pool.oneFirst<number>(sql`
                        SELECT SUM(amount) as total FROM weed_seeds
                        WHERE account_id = ${user.id}
                    `);
                    return result;
                },
                add: async (amount: number) => {
                    await pool.query(sql`
                        INSERT INTO weed_seeds (id, account_id, amount, created_at)
                        VALUES (${Randomstring.generate()}, ${
                        user.id
                    }, ${amount}, ${Date.now()});
                    `);
                },
            },
            growing: {
                count: async () => {
                    const result = await pool.oneFirst<number>(sql`
                        SELECT SUM(amount) as total FROM weed_growing
                        WHERE account_id = ${user.id}
                    `);
                    return result;
                },
                speed: async () => 1,
                add: async (amount: number) => {
                    await pool.query(sql`
                        INSERT INTO weed_growing (id, account_id, amount, created_at)
                        VALUES (${Randomstring.generate()}, ${
                        user.id
                    }, ${amount}, ${Date.now()});
                    `);
                },
            },
            grown: {
                count: async () => {
                    const result = await pool.oneFirst<number>(sql`
                        SELECT SUM(amount) as total FROM weed_growing
                        WHERE account_id = ${user.id}
                    `);
                    return result;
                },
                add: async (amount: number) => {
                    await pool.query(sql`
                        INSERT INTO weed_grown (id, account_id, amount, created_at)
                        VALUES (${Randomstring.generate()}, ${
                        user.id
                    }, ${amount}, ${Date.now()});
                    `);
                },
            },
            storage: {
                count: async () => {
                    const result = await pool.oneFirst<number>(sql`
                        SELECT SUM(amount) as total FROM weed_storage
                        WHERE account_id = ${user.id}
                    `);
                    return result;
                },
                add: async (amount: number) => {
                    await pool.query(sql`
                        INSERT INTO weed_storage (id, account_id, amount, created_at)
                        VALUES (${Randomstring.generate()}, ${
                        user.id
                    }, ${amount}, ${Date.now()});
                    `);
                },
            },
            limits: {
                seeds: async () => {
                    const result = await pool.oneFirst<number>(sql`
                        SELECT seeds FROM weed_limits
                        WHERE account_id = ${user.id} LIMIT 1
                    `);
                    return result;
                },
                growing: async () => {
                    const result = await pool.oneFirst<number>(sql`
                        SELECT growing FROM weed_limits
                        WHERE account_id = ${user.id} LIMIT 1
                    `);
                    return result;
                },
                storage: async () => {
                    const result = await pool.oneFirst<number>(sql`
                        SELECT storage FROM weed_limits
                        WHERE account_id = ${user.id} LIMIT 1
                    `);
                    return result;
                },
            },
        },
    };
    return accountobj;
}