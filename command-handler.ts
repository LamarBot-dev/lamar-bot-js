import { Discord } from "./discordclient";

// 0 = command not found
// 1 = command found and executed
// 2 = no prefix
// 3 = bot

type commandType = { [key: string]: innerCommandType };

type commandFunctionType = ({}: {
    message:
        | Discord.ChatInputCommandInteraction<Discord.CacheType>
        | Discord.MessageContextMenuCommandInteraction<Discord.CacheType>
        | Discord.UserContextMenuCommandInteraction<Discord.CacheType>;
    args: readonly Discord.CommandInteractionOption<Discord.CacheType>[];
}) => void;
type innerCommandType = commandFunctionType | commandType;

export type { commandType, commandFunctionType, innerCommandType };
