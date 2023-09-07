const os = require("os");
const moment = require("moment-timezone");


module.exports = async ({ api, event, userInfo, config }) => {
  const { admins, banned } = config;
  let input = event.body.toLowerCase();
  let data = input.split(" ");
  try {
    if (input.startsWith("!stats")) {
      const currentTime = moment()
        .tz("Asia/Manila")
        .format("YYYY-MM-DD hh:mm:ss A");

      const threads = await api.getThreadList(99999, null, ["INBOX"]);

      let userCount = 0;
      let groupCount = 0;

      threads.forEach((thread) => {
        if (thread.isGroup) {
          groupCount++;
        } else {
          userCount++;
        }
      });

      const output = `Hello ${userInfo.name}, here is the current server snapshot as of ${currentTime}.\n\n- Users: ${userCount}\n- Groups: ${groupCount}`;

      api.sendMessage(output, event.threadID, event.messageID);
    } else if (input.startsWith("!shell")) {
      if (admins.includes(event.senderID)) {
        let data = event.body.split(" ");
        const { exec } = require("child_process");
        if (data.length < 2) {
          api.sendMessage("Enter command.", event.threadID, event.messageID);
        } else {
          data.shift();
          let cmd = data.join(" ");
          exec(cmd, (error, stdout, stderr) => {
            if (error) {
              api.sendMessage(
                `Error: \n${error.message}`,
                event.threadID,
                event.messageID
              );
              return;
            }
            if (stderr) {
              api.sendMessage(
                `Stderr:\n ${stderr}\n${stdout}`,
                event.threadID,
                event.messageID
              );
              return;
            }
            api.sendMessage(`${stdout}`, event.threadID, event.messageID);
          });
        }
      } else {
        api.sendMessage(
          "Sorry, but you do not have the necessary permission to use this command.",
          event.threadID,
          event.messageID
        );
      }
    } else if (input.startsWith("!sysinfo")) {
      if (admins.includes(event.senderID)) {
        const currentTime = moment()
          .tz("Asia/Manila")
          .format("YYYY-MM-DD hh:mm:ss A");
        const uptime = process.uptime();
        const hours = Math.floor(uptime / 3600);
        const minutes = Math.floor((uptime - hours * 3600) / 60);
        const seconds = Math.floor(uptime % 60);
        const uptimeStr = `${hours} hours, ${minutes} minutes, and ${seconds} seconds`;
        let cpu = os.loadavg();
        let ut = os.uptime();
        let sec = ut;
        let min = sec / 60;
        let hr = min / 60;
        sec = Math.floor(sec);
        min = Math.floor(min);
        hr = Math.floor(hr);
        sec = sec % 60;
        min = min % 60;
        hr = hr % 60;
        let totalMemoryGB = Math.round((os.totalmem() / 1000000000) * 10) / 10;
        let freeMemoryGB = Math.round((os.freemem() / 1000000000) * 10) / 10;
        let averageLoad = cpu[0] / os.cpus().length;
        let crashStatus = "No crashes detected";
        api.sendMessage(
          {
            body: `Hello ${
              userInfo.name
            }, here is the current system information as of ${currentTime}. Your account has been logged in for approximately ${uptimeStr}.\n\n• CPU Usage: ${averageLoad.toFixed(
              2
            )}\n• CPU-0: ${Math.trunc(cpu[0])}%\n• CPU-1: ${Math.trunc(
              cpu[1]
            )}%\n• CPU-2: ${Math.trunc(cpu[2])}%\n• CPU-3: ${Math.trunc(
              cpu[3]
            )}%\n\n• OS: ${os.arch()} ${os.type()}\n• OS Version: ${os.version()}\n• RAM: ${totalMemoryGB}GB/4GB\n• ROM: ${freeMemoryGB}GB/50GB\n• Crash: ${crashStatus}`,
          },
          event.threadID,
          event.messageID
        );
      } else {
        api.sendMessage(
          "Sorry, but you do not have the necessary permission to use this command.",
          event.threadID,
          event.messageID
        );
      }
    } else if (input.startsWith("!clearcache")) {
      if (admins.includes(event.senderID)) {
        const fs = require("fs");
        const folderPath = "./cache/";
        fs.readdir(folderPath, (err, files) => {
          if (err) {
            console.log("Error reading directory:", err);
            api.sendMessage(
              "Error reading directory.",
              event.threadID,
              event.messageID
            );
          } else {
            const fileCount = files.length;
            let deletedCount = 0;
            let totalSize = 0;
            let deletedFiles = [];
            if (fileCount === 0) {
              console.log("No files to delete.");
              api.sendMessage(
                "No files to delete.",
                event.threadID,
                event.messageID
              );
            } else {
              files.forEach((file) => {
                const filePath = folderPath + "/" + file;
                fs.stat(filePath, (err, stats) => {
                  if (err) {
                    console.log("Error getting file stats:", err);
                  } else {
                    const fileSizeInBytes = stats.size;
                    totalSize += fileSizeInBytes;
                    fs.unlink(filePath, (err) => {
                      if (err) {
                        console.log("Error deleting file:", err);
                      } else {
                        deletedCount++;
                        deletedFiles.push(file);
                        console.log("Deleted file:", file);
                      }
                      if (deletedCount === fileCount) {
                        console.log("Deleted", deletedCount, "files.");
                        console.log(
                          "Total size of deleted files:",
                          totalSize,
                          "bytes"
                        );
                        console.log("Deleted files:", deletedFiles);
                        const threadID = event.threadID;
                        const message =
                          "Deleted " +
                          deletedCount +
                          " files. Total size: " +
                          totalSize +
                          " bytes\n\nDeleted files:\n" +
                          deletedFiles.join("\n");
                        api.sendMessage(message, threadID, event.messageID);
                      }
                    });
                  }
                });
              });
            }
          }
        });
      } else {
        api.sendMessage(
          "Sorry, but you do not have the necessary permission to use this command.",
          event.threadID,
          event.messageID
        );
      }
    }
  } catch (error) {
    console.error("Error:", error);
  }
};