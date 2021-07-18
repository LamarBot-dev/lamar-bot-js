const { Discord, disbut } = require("./discordclient");
const { data } = require("./data");
const referencetouser = {};
const weedmenu = {};
const weedupgradesmenu = {};

function numberWithCommas(x) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

const buttoncontrols = (data, button) => {
  if (referencetouser[button.message.id] == button.clicker.user.id) {
    const account = data.current.users[button.clicker.user.id];
    const business = account.businesses.weed;
    let update = false;
    let updateupgrades = false;
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
              business.data.growing[i] = undefined;
            }
          }
        }
        business.data.growing = business.data.growing.filter(function (el) {
          return el != null;
        });
        business.data.storage += toAdd;
        update = true;
      }
    } else if (button.id == "wsellall") {
      if (business.data.storage > 0) {
        account.money += business.data.storage * 10;
        business.data.storage = 0;
        update = true;
      }
    } else if (button.id == "wuseeds") {
      if (account.money - business.limits.seeds * 3 > 0) {
        account.money -= business.limits.seeds * 3;
        business.limits.seeds *= 2;
        updateupgrades = true;
        update = true;
      }
    } else if (button.id == "wugrowing") {
      if (account.money - business.limits.growing * 3 > 0) {
        account.money -= business.limits.growing * 3;
        business.limits.growing *= 2;
        updateupgrades = true;
        update = true;
      }
    } else {
      if (account.money - business.limits.storage * 3 > 0) {
        account.money -= business.limits.storage * 3;
        business.limits.storage *= 2;
        updateupgrades = true;
        update = true;
      }
    }
    if (update) {
      weedmenu[button.clicker.user.id].edit(
        weedembedrenderer(button.clicker.user, business)
      );
    }
    if (updateupgrades) {
      weedupgradesmenu[button.clicker.user.id].edit(
        new Discord.MessageEmbed()
          .setTitle("UPGRADES")
          .addFields([
            {
              name: "SEED LIMIT",
              value: `$${numberWithCommas(
                business.limits.seeds * 3
              )} to get ${numberWithCommas(business.limits.seeds * 2)}`,
            },
            {
              name: "GROWING LIMIT",
              value: `$${numberWithCommas(
                business.limits.growing * 3
              )} to get ${numberWithCommas(business.limits.growing * 2)}`,
            },
            {
              name: "STORAGE LIMIT",
              value: `$${numberWithCommas(
                business.limits.storage * 3
              )} to get ${numberWithCommas(business.limits.storage * 2)}`,
            },
          ])
          .setThumbnail(
            "https://github.com/Ugric/lamar-bot-js/blob/main/images/weed.png?raw=true&nocache=1"
          )
          .setImage(
            "https://github.com/Ugric/lamar-bot-js/blob/main/images/smoke%20on%20the%20water.png?raw=true"
          )
          .setColor("#047000")
      );
    }
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
    .addFields([
      {
        name: "CASH",
        value: `$${numberWithCommas(data.current.users[author.id].money)}`,
      },
      {
        name: "SEEDS",
        value: `${numberWithCommas(weed.data.seeds)} / ${numberWithCommas(
          weed.limits.seeds
        )} ${Math.floor((weed.data.seeds / weed.limits.seeds) * 100)}%`,
      },
      {
        name: "GROWING",
        value: `${numberWithCommas(growingnum)} / ${numberWithCommas(
          weed.limits.growing
        )} ${Math.floor((growingnum / weed.limits.growing) * 100)}%`,
      },
      {
        name: "STORAGE",
        value: `${numberWithCommas(weed.data.storage)} / ${numberWithCommas(
          weed.limits.storage
        )} ${Math.floor((weed.data.storage / weed.limits.storage) * 100)}%`,
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
    weedupgradesmenu[message.author.id].delete().catch(() => {});
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
  weedupgradesmenu[message.author.id] = await message.reply(
    new Discord.MessageEmbed()
      .setTitle("UPGRADES")
      .addFields([
        {
          name: "SEED LIMIT",
          value: `$${numberWithCommas(
            data.current.users[message.author.id].businesses.weed.limits.seeds *
              3
          )} to get ${numberWithCommas(
            data.current.users[message.author.id].businesses.weed.limits.seeds *
              2
          )}`,
        },
        {
          name: "GROWING LIMIT",
          value: `$${numberWithCommas(
            data.current.users[message.author.id].businesses.weed.limits
              .growing * 3
          )} to get ${numberWithCommas(
            data.current.users[message.author.id].businesses.weed.limits
              .growing * 2
          )}`,
        },
        {
          name: "STORAGE LIMIT",
          value: `$${numberWithCommas(
            data.current.users[message.author.id].businesses.weed.limits
              .storage * 3
          )} to get ${numberWithCommas(
            data.current.users[message.author.id].businesses.weed.limits
              .storage * 2
          )}`,
        },
      ])
      .setThumbnail(
        "https://github.com/Ugric/lamar-bot-js/blob/main/images/weed.png?raw=true&nocache=1"
      )
      .setColor("#047000")
      .setImage(
        "https://github.com/Ugric/lamar-bot-js/blob/main/images/smoke%20on%20the%20water.png?raw=true"
      ),
    new disbut.MessageActionRow()
      .addComponent(
        new disbut.MessageButton()
          .setStyle("blurple")
          .setID("wuseeds")
          .setLabel("UPGRADE SEEDS")
      )
      .addComponent(
        new disbut.MessageButton()
          .setStyle("blurple")
          .setID("wugrowing")
          .setLabel("UPGRADE GROWING")
      )
      .addComponent(
        new disbut.MessageButton()
          .setStyle("blurple")
          .setID("wustorage")
          .setLabel("UPGRADE STORAGE")
      )
  );
  referencetouser[weedmenu[message.author.id].id] = message.author.id;
  referencetouser[weedupgradesmenu[message.author.id].id] = message.author.id;
};
module.exports = { buttoncontrols, weedmenu, weedstart };
