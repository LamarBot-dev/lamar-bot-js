import { Discord } from "./discordclient";

const ChannelMessage = `Yo, listen up, playa! Ready to kickstart your life of crime? Well, look no further than the power of \`/create\`!

Type in \`/create\` and \`/weed\` to start your very own weed farm and dive into the lucrative business of growing that green goodness. Get ready to roll up your sleeves and cultivate the finest buds in Los Santos!

But that ain't all, playa! You can also use \`/lifeinvader\` to follow and make posts on LifeInvader, the social media platform that keeps you connected to the pulse of San Andreas. Share your achievements, connect with other players, and keep the world updated on your criminal endeavors!

We're also cooking up some surprises that'll add even more depth and excitement to your criminal escapades. From new illicit businesses to thrilling gang wars, get ready for an adrenaline-fueled ride like no other.

So, grab your crew, load up your weapons, and let's dive headfirst into the criminal underworld. The city is waiting, homie! Let's make some paper! 💥💰🚗`;

const ChannelMessageExplicit = `Yo, listen up my nigga! Ready to kickstart your life of crime? Well, look no further than the power of the motherfuckin \`/create\` command!

Type in \`/create\` and \`/weed\` to start your very own weed farm and dive into the lucrative business of growing that good shit. Get ready to roll up your sleeves and cultivate the finest buds in Los Santos!

But that ain't all, my nig! You can also use \`/lifeinvader\` to follow and make posts on LifeInvader, the social media platform that keeps you connected to the pulse of San Andreas. Share your achievements, connect with other players, and keep the world updated on your criminal endeavors!

We're also cooking up some surprises that'll add even more depth and excitement to your criminal escapades. From new illicit businesses to thrilling gang wars, get ready for an adrenaline-fueled ride like no other.

So, grab your crew, load up your weapons, and let's dive head fuckin first into the criminal underworld. The city is waiting, nigga! Let's make some paper! 💥💰🚗`;

async function sendChannelMessage(channel: Discord.TextBasedChannel) {
    if ("nsfw" in channel && channel.nsfw) {
        return channel.send({
            embeds: [
                new Discord.EmbedBuilder()
                    .setAuthor({
                        name: "Lamar",
                        iconURL:
                            "https://github.com/Ugric/lamar-bot-js/blob/main/images/lamar%20profile.PNG?raw=true",
                    })
                    .setDescription(ChannelMessageExplicit),
            ],
        });
    }
    return channel.send({
        embeds: [
            new Discord.EmbedBuilder()
                .setAuthor({
                    name: "Lamar",
                    iconURL:
                        "https://github.com/Ugric/lamar-bot-js/blob/main/images/lamar%20profile.PNG?raw=true",
                })
                .setDescription(ChannelMessage),
        ],
    });
}

export default sendChannelMessage;
