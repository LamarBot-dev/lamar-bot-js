import { sql } from "slonik";
import getDatabase from "../postgres";

setInterval(async () => {
    try {
    const pool = await getDatabase();
    const accounts = await pool.many(sql`
        SELECT id FROM accounts
    `).catch(() => []);
    for (const account of accounts) {
        
    }

    } catch (e) {
        console.error(e);
    }
}, 10000);
