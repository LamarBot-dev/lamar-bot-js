import { Discord } from "./discordclient";

type commandType = { [key: string]: innerCommandType };

type commandFunctionType<T=void> = (
    interaction: Discord.ChatInputCommandInteraction<Discord.CacheType>
) => Promise<T>;
type innerCommandType = commandFunctionType | commandType;

export type { commandType, commandFunctionType, innerCommandType };
