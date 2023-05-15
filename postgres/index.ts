import { createPool, DatabasePool } from "slonik";
import { abort } from "process";

let pool: DatabasePool | undefined;
async function getDatabase() {
    if (!pool) {
        if (!process.env.DATABASE_URL) abort();
        pool = await createPool(process.env.DATABASE_URL);

        // set up tables
        (async () => {

        })();
    }
    return pool;
}
export default getDatabase;