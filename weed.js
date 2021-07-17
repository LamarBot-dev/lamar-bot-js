const { Discord, disbut } = require("./discordclient");
const { data } = require("./data");
const weedmenu = {};

const buttoncontrols = (data, button) => {
  const account = data.current.users[button.clicker.user.id];
  const business = account.businesses.weed;
  let update = false;
  const storageLeft = business.limits.storage - business.data.storage;
  let growingnum = 0;
  for (const grow of business.data.growing) {
    growingnum += grow.amount;
  }
  if (button.id == "wbuymax") {
    const tobuy = business.limits.seeds - business.data.seeds;
    if (tobuy > 0 && account.money > 0) {
      if (account.money - tobuy < 0) {
        business.data.seeds += account.money;
        account.money = 0;
      } else {
        business.data.seeds += tobuy;
        account.money -= tobuy;
      }
      update = true;
    }
  } else if (button.id == "wplant") {
    if (business.data.seeds > 0 && growingnum < business.limits.growing) {
      const maxToPlant = business.limits.growing - growingnum;
      const toPlant =
        maxToPlant < business.data.seeds ? maxToPlant : business.data.seeds;

      business.data.seeds -= toPlant;
      business.data.growing.push({
        amount: toPlant,
        time: new Date().getTime(),
      });
      update = true;
    }
  } else if (button.id == "wpick") {
    if (growingnum > 0 && storageLeft > 0) {
      const todel = [];
      let toAdd = 0;
      const currentTime = new Date().getTime();
      for (let i = 0; i < business.data.growing.length; i++) {
        if (currentTime - business.data.growing[i].time >= 60000) {
          if (storageLeft - toAdd - business.data.growing[i].amount < 0) {
            business.data.growing[i].amount = -(
              storageLeft -
              toAdd -
              business.data.growing[i].amount
            );
            toAdd = storageLeft;
            break;
          } else {
            toAdd += business.data.growing[i].amount;
            todel.push(business.data.growing[i]);
          }
        }
      }
      for (const value in todel) {
        business.data.growing.splice(business.data.growing.indexOf(value), 1);
      }
      business.data.storage += toAdd;
      update = true;
    }
  } else {
    if (business.data.storage > 0) {
      account.money += business.data.storage * 10;
      business.data.storage = 0;
      update = true;
    }
  }
  if (update) {
    weedmenu[button.clicker.user.id].edit(
      weedembedrenderer(button.clicker.user, business)
    );
  }
};

const weedembedrenderer = (author, weed) => {
  let growingnum = 0;
  for (const grow of weed.data.growing) {
    growingnum += grow.amount;
  }
  return new Discord.MessageEmbed()
    .setAuthor(author.tag, author.avatarURL())
    .setTitle("WEED FARM")
    .addField("CASH", `$${data.current.users[author.id].money}`)
    .addFields([
      { name: "SEEDS", value: `${weed.data.seeds} / ${weed.limits.seeds}` },
      { name: "GROWING", value: `${growingnum} / ${weed.limits.growing}` },
      {
        name: "STORAGE",
        value: `${weed.data.storage} / ${weed.limits.storage}`,
      },
    ])
    .setThumbnail(
      "https://github.com/Ugric/lamar-bot-js/blob/main/images/weed.png?raw=true&nocache=1"
    )
    .setImage(
      "https://github.com/Ugric/lamar-bot-js/blob/main/images/lamar%20weed%20farm.jpg?raw=true"
    )
    .setDescription(`buy and sell weed with the controls at the bottom!`)
    .setColor("#047000");
};

const weedstart = async ({ message }) => {
  if (weedmenu[message.author.id]) {
    weedmenu[message.author.id].delete().catch(() => {});
  }
  weedmenu[message.author.id] = await message.reply(
    weedembedrenderer(
      message.author,
      data.current.users[message.author.id].businesses.weed
    ),
    new disbut.MessageActionRow()
      .addComponent(
        new disbut.MessageButton()
          .setStyle("blurple")
          .setID("wbuymax")
          .setLabel("💵 buy max seeds")
      )
      .addComponent(
        new disbut.MessageButton()
          .setStyle("blurple")
          .setID("wplant")
          .setLabel("🌱 plant seeds")
      )
      .addComponent(
        new disbut.MessageButton()
          .setStyle("blurple")
          .setID("wpick")
          .setLabel("✂ pick grown")
      )
      .addComponent(
        new disbut.MessageButton()
          .setStyle("blurple")
          .setID("wsellall")
          .setLabel("💸 sell all storage")
      )
  );
};
module.exports = { buttoncontrols, weedmenu, weedstart };
