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
                    weed_seeds INT not NULL DEFAULT 0,
                    weed_storage INT not NULL DEFAULT 0,
                    weed_limits_seeds INT not NULL DEFAULT 0,
                    weed_limits_growing INT not NULL DEFAULT 0,
                    weed_limits_storage INT not NULL DEFAULT 0
                )`
            );
             
            await pool.query(
                sql`CREATE TABLE IF NOT EXISTS transactions (
                    id TEXT PRIMARY KEY not NULL,
                    account_id TEXT not NULL,
                    amount INT not NULL,
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
                    amount INT not NULL,
                    picked BOOLEAN not NULL,
                    created_at BIGINT not NULL
                )`
            );
            
        })();
    }
    return pool;
}
export default getDatabase;