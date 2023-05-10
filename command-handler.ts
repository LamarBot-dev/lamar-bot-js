import { Discord } from "./discordclient";

// 0 = command not found
// 1 = command found and executed
// 2 = no prefix
// 3 = bot

type commandType = { [key: string]: innerCommandType };

type commandFunctionType = (({}: { message: Discord.Message; args: string[] }) => void)
type innerCommandType =
    | commandFunctionType
    | commandType;

export const CHandle = async ({
        message,
        prefix,
        commands = {
            ping: ({
                message,
            }: {
                message: Discord.Message;
                args: string[];
            }) => {
                message.reply("ping");
            },
        },
        options = { allowbots: false },
        notfound = (args: string[]) => {
            console.error("not found:", args.join(" "));
        },
    }: {
        message: Discord.Message;
        prefix: string;
        commands: commandType;
        options?: { allowbots: boolean };
        notfound: (args: string[]) => void;
    }): Promise<number> => {
        if (
            !message.content.toLowerCase().startsWith(prefix.toLowerCase()) ||
            (message.author.bot && !options.allowbots)
        )
            return !message.content
                .toLowerCase()
                .startsWith(prefix.toLowerCase())
                ? 2
                : 3;
        const args = message.content
            .toLowerCase()
            .slice(prefix.length)
            .trim()
            .split(/ +/);
        let commandpart: innerCommandType = commands;
        for (let index = 0; index < args.length; index++) {
            const command = args[index];
            console.log(command, commandpart, command in commandpart);
            if (command in commandpart && typeof commandpart == "object") {
                if (typeof commandpart[command] == "function") {
                    (commandpart[command] as any)({
                        message,
                        args: args.slice(index+1, args.length),
                    });
                    return 1;
                } else {
                    commandpart = commandpart[command];
                }
            } else {
                notfound(args);
                return 0;
            }
        }

        notfound(args);
        return 0;
    };
export type { commandType, commandFunctionType, innerCommandType };