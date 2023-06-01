import { sql } from "slonik";
import getDatabase from "../postgres";
import get_weed_farm from "./calculate";
import { Discord, client } from "../discordclient";

setInterval(async () => {
    const pool = await getDatabase();
    const accounts = await pool
        .manyFirst<string>(
            sql`
        SELECT id FROM accounts WHERE NOT weed_notified
    `
        )
        .catch(() => []);
    accounts.forEach(async (id) => {
        const weed = await get_weed_farm(id);
        if (!(await weed.count.fully_grown())) return;
        const user = await client.users.fetch(id);
        pool.query(sql`UPDATE accounts SET weed_notified = true WHERE id = ${id}`);
        user.send({
            embeds: [
                new Discord.EmbedBuilder()
                    .setTitle("Weed finished growing")
                    .setAuthor({
                        name: user.tag,
                        iconURL: user.avatarURL() || undefined,
                    })
                    .setDescription(
                        `Your weed has finished growing, you can pick it now`
                    )
                    .setColor("#047000")
                    .setThumbnail(
                        "https://github.com/Ugric/lamar-bot-js/blob/main/images/weed.png?raw=true&nocache=1"
                    ),
            ],
        });
    });
}, 60000);
