import { Discord } from "./discordclient";

// 0 = command not found
// 1 = command found and executed
// 2 = no prefix
// 3 = bot

type commandType = { [key: string]: innerCommandType };

type commandFunctionType<T=void> = (
    interaction: Discord.ChatInputCommandInteraction<Discord.CacheType>
) => Promise<T>;
type innerCommandType = commandFunctionType | commandType;

export type { commandType, commandFunctionType, innerCommandType };
