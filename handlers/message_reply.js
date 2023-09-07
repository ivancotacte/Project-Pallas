module.exports = async ({ api, event, config, userInfo, globalData }) => {
  const { name, prefix } = config;
  let input = event.body;
  let cID = api.getCurrentUserID();
  let currentUserInfo = await api.getUserInfo(cID);
  currentUserInfo = currentUserInfo[cID];
  if (input.startsWith(`${prefix}`)) {
    let cmd = input.substring(1);
    cmd = cmd.split(" ");
    try {
      if (cmd[0].length == 0) {
        const welcome = [`Wassup,`, `Hello,`, "Supp,", "Wazzup,"];
        const randomIndex = Math.floor(Math.random() * welcome.length);
        const welcomeMessage = welcome[randomIndex];
        return api.sendMessage(
          {
            body: welcomeMessage + " " + userInfo.name + ", that's my prefix.",
          },
          event.threadID,
          event.messageID
        );
      } else {
        let runIt = require(`../commands/${cmd[0]}`);
        runIt.runFunction({
          api,
          event,
          config,
          userInfo,
          currentUserInfo,
          globalData,
        });
      }
    } catch (err) {
      if (err.code == "MODULE_NOT_FOUND") {
        api.sendMessage(
          `'${cmd[0]}' command is not found on the command list.`,
          event.threadID,
          event.messageID
        );
      } else {
        console.log(err);
        api.sendMessage(`Error: ${err}`, event.threadID, event.messageID);
      }
    }
  }
};
