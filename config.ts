import dotenv from "dotenv";

dotenv.config();

export const token = process.env.TOKEN ?? "";
export const startup = Boolean(process.env.STARTUP);
export const clientID = process.env.CLIENT_ID ?? "";
export const DEV_MODE = Boolean(process.env.DEV_MODE);