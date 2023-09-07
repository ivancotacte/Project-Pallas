module.exports.runFunction = async ({ api, event }) => {
  const axios = require("axios");
  const request = require("request");
  const fs = require("fs");
  try {
    const { data } = await axios.get(
      "https://shoti-api.libyzxy0.repl.co/api/get-shoti?apikey=shoti-1h784d7d7ai8gc3g21o",
    );
    const file = fs.createWriteStream(__dirname + "/../cache/shoti.mp4");
    const rqs = request(encodeURI(data.data.url));
    rqs.pipe(file);
    file.on("finish", () => {
      api.sendMessage(
        {
          body: `Username: ${data.user.username}\nNickname: ${data.user.nickname}\nID: ${data.user.id}`,
          attachment: fs.createReadStream(__dirname + "/../cache/shoti.mp4"),
        },
        event.threadID,
        event.messageID,
      );
    });
  } catch (error) {
    console.error(
      "[ERROR] An error occurred while processing the command.",
      error,
    );
    api.sendMessage(
      "An error occurred while processing the command.",
      event.threadID,
    );
  }
};
