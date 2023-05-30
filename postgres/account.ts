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
    lifeinvader: {
        follow: (id: string) => Promise<void>;
        unfollow: (id: string) => Promise<void>;
        followers: () => Promise<string[]>;
        following: () => Promise<string[]>;
    };
};

export async function get_account(userID: string): Promise<account | null> {
    const pool = await getDatabase();
    const account = await pool.maybeOne(
        sql`SELECT id FROM accounts WHERE id = ${userID}`
    );
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
        lifeinvader: {
            followers: async () => {
                const followers = await pool
                    .manyFirst<string>(
                        sql`
                    SELECT follower_id FROM followers WHERE following_id = ${userID}
                `
                    )
                    .catch(() => []);
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
            },
        },
    };
    return accountobj;
}
