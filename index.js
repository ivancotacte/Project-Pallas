const fs = require("fs");
const login = require("./login");
const path = require("path");
const config = require("./config");
let globalData = {};

const proxy = {
  protocol: "https",
  host: "158.62.27.226",
  port: 8191,
  type: "https",
  anonymityLevel: "elite",
  country: "PH",
  city: "Pasig",
  hostname: "158.62.27.226",
};

const local = {
  timezone: "Asia/Manila",
  region: "ph",
  headers: {
    "X-Facebook-Locale": "en_US",
    "X-Facebook-Timezone": "Asia/Manila",
    "X-Fb-Connection-Quality": "EXCELLENT",
  },
};
const appStatePath = path.join(__dirname, "./session.json");
const credentials = JSON.parse(fs.readFileSync(appStatePath, "utf8"));
login({ appState: credentials, proxy: proxy, local: local }, (err, api) => {
  if (err) return console.error(err);

  api.setOptions({
    forceLogin: true,
    listenEvents: true,
    autoMarkDelivery: false,
    selfListen: true,
  });

  api.listenMqtt(async (err, event) => {
    if (err) return console.error(err);

    let userInfo = await api.getUserInfo(event.senderID);
    userInfo = userInfo[event.senderID];

    if (event.type == "message") {
      require("./handlers/adminHandler")({ api, event, userInfo, config });
      require("./handlers/message")({
        api,
        event,
        config,
        userInfo,
        globalData,
      });
    } else if (event.type == "message_reply") {
      require("./handlers/message_reply")({
        api,
        event,
        config,
        userInfo,
        globalData,
      });
    } else if (event.type == "event") {
      require("./handlers/eventHandler")({ api, event });
    }
  });
});
