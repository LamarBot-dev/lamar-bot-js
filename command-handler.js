module.exports = {
    CHandle: async ({
        message,
        prefix,
        commands = {
            ping: ({ message }) => {
                message.reply("ping");
            },
        },
        options = { allowbots: false },
        notfound = (args) => {
            console.error("not found:", args.join(" "));
        },
    }) => {
        if (
            !message.content.toLowerCase().startsWith(prefix.toLowerCase()) ||
            (message.author.bot && !options.allowbots)
        )
            return !message.content.toLowerCase().startsWith(prefix.toLowerCase()) ? "no-prefix" : "bot";
        const args = message.content
            .toLowerCase()
            .slice(prefix.length)
            .trim()
            .split(/ +/);
        let commandpart = commands;
        for (let index = 0; index < args.length; index++) {
            const command = args[index];
            if (command in commandpart) {
                if (typeof commandpart[command] == "object") {
                    commandpart = commandpart[command];
                } else {
                    commandpart[command]({
                        args: args.slice(index + 1, args.length),
                        message,
                    });
                    return "run-function";
                }
            } else {
                notfound(args);
                return "not-found";
            }
        }

        notfound(args);
        return "not-found";
    },
};
