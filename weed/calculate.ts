import getDatabase from "../postgres";
import Randomstring from "randomstring";
import { sql } from "slonik";
import { get_account } from "../postgres/account";
import humanizeDuration from "humanize-duration";

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
                const balance = await accountobj.money.balance();
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
                const balance = await accountobj.money.balance();
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
                const balance = await accountobj.money.balance();
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
                const balance = await accountobj.money.balance();
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
            const balance = await accountobj.money.balance();
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
            const topromise: Promise<any>[] = [
                pool.query(sql`
                    UPDATE accounts SET
                        weed_seeds = weed_seeds - ${toplant} WHERE id = ${userID}
                `),
            ];
            const weed = await pool.maybeOneFirst<string>(sql`
                    SELECT id FROM weed_growing WHERE account_id = ${userID} AND amount > 0 LIMIT 1
                `);
            if (weed) {
                pool.query(sql`
                    UPDATE weed_growing SET
                        amount = amount + ${toplant} WHERE id = ${weed}
                `);
            } else {
                topromise.push(
                    pool.query(sql`
                        INSERT INTO weed_growing (id, account_id, amount, created_at)
                        VALUES (${Randomstring.generate()}, ${userID}, ${toplant}, ${Date.now()});
                    `)
                );
            }
            await Promise.all(topromise);
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
                    SELECT id, amount, created_at FROM weed_growing WHERE account_id = ${userID} AND amount > 0 LIMIT 1
                `
                )
                .catch(() => []);
            const speed = 10000 * (1 / account.weed_grow_speed_upgrade);
            let picked = 0;
            const topromise: Promise<any>[] = [];
            const plant = growing[0];
            if (!plant) return 0;
            const grown = Math.min(
                Math.floor((now - plant.created_at) / speed),
                plant.amount,
                account.weed_limits_storage - account.weed_storage - picked
            );
            picked += grown;
            const timetaken = Math.floor(grown * speed);
            if (grown <= 0) return 0;
            topromise.push(
                pool.query(sql`
                        UPDATE weed_growing SET
                            amount = amount - ${grown}, created_at = created_at + ${timetaken} WHERE id = ${plant.id}
                    `)
            );
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

export default get_weed_farm;
