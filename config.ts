import dotenv from "dotenv";

dotenv.config();

export const token = process.env.TOKEN ?? "";
export const clientID = process.env.CLIENT_ID ?? "";