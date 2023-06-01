import { createPool, DatabasePool, sql } from "slonik";
import { abort } from "process";

let pool: DatabasePool | undefined;
async function getDatabase() {
    if (!pool) {
        if (!process.env.DATABASE_URL) abort();
        pool = await createPool(process.env.DATABASE_URL);

        // set up tables
        (async () => {
            await pool.query(
                sql`CREATE TABLE IF NOT EXISTS accounts (
                    id TEXT PRIMARY KEY not NULL,
                    created_at BIGINT not NULL,
                    weed_grow_speed_upgrade INT not NULL DEFAULT 1,
                    weed_seeds BIGINT not NULL DEFAULT 0,
                    weed_storage BIGINT not NULL DEFAULT 0,
                    weed_limits_seeds BIGINT not NULL DEFAULT 20,
                    weed_limits_growing BIGINT not NULL DEFAULT 10,
                    weed_limits_storage BIGINT not NULL DEFAULT 30,
                    weed_notified BOOLEAN not NULL DEFAULT FALSE
                )`
            );

            await pool.query(
                sql`CREATE TABLE IF NOT EXISTS transactions (
                    id TEXT PRIMARY KEY not NULL,
                    account_id TEXT not NULL,
                    amount BIGINT not NULL,
                    reference TEXT not NULL,
                    created_at BIGINT not NULL
                )`
            );

            await pool.query(
                sql`CREATE TABLE IF NOT EXISTS followers (
                    follower_id TEXT not NULL,
                    following_id TEXT not NULL,
                    created_at BIGINT not NULL
                )`
            );

            await pool.query(
                sql`CREATE TABLE IF NOT EXISTS weed_growing (
                    id TEXT PRIMARY KEY not NULL,
                    account_id TEXT not NULL,
                    amount BIGINT not NULL,
                    created_at BIGINT not NULL
                )`
            );

            // alter tables
            pool.query(
                sql`ALTER TABLE accounts ADD weed_notified BOOLEAN not NULL DEFAULT FALSE`
            ).catch(() => {});

            pool.query(
                sql`ALTER TABLE accounts ALTER COLUMN weed_seeds TYPE BIGINT`
            ).catch(() => {});
            pool.query(
                sql`ALTER TABLE accounts ALTER COLUMN weed_storage TYPE BIGINT`
            ).catch(() => {});
            pool.query(
                sql`ALTER TABLE accounts ALTER COLUMN weed_limits_seeds TYPE BIGINT`
            ).catch(() => {});
            pool.query(
                sql`ALTER TABLE accounts ALTER COLUMN weed_limits_growing TYPE BIGINT`
            ).catch(() => {});
            pool.query(
                sql`ALTER TABLE accounts ALTER COLUMN weed_limits_storage TYPE BIGINT`
            ).catch(() => {});
            pool.query(
                sql`ALTER TABLE transactions ALTER COLUMN amount TYPE BIGINT`
            ).catch(() => {});
            pool.query(
                sql`ALTER TABLE weed_growing ALTER COLUMN amount TYPE BIGINT`
            ).catch(() => {});
        })();
    }
    return pool;
}
export default getDatabase;
