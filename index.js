const fs = require("fs");
const login = require("./login");
const path = require("path");

const proxy = {
  protocol: "https",
  host: "103.69.108.78",
  port: 8191,
  type: "https",
  anonymityLevel: "elite",
  country: "PH",
  city: "Taguig",
  hostname: "103.69.108.78 (CITI Cableworld Inc.)",
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
    online: true,
  });

  api.listenMqtt(async (err, event) => {
    if (err) return console.error(err);

    let userInfo = await api.getUserInfo(event.senderID);
    userInfo = userInfo[event.senderID];

    if (event.type == "message") {
    } else if (event.type == "event") {
      require("./handlers/eventHandler")({ api, event });
    }
  });
});
