const { Configuration, OpenAIApi } = require("openai");
const configuration = new Configuration({
  apiKey: "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",
});
module.exports = async ({ api, event }) => {
  const openai = new OpenAIApi(configuration);
  let input = event.body.toLowerCase();
  let data = input.split(" ");
  if (data.length < 2) {
    const message = ["What", "Yes", "Wassup"];
    const randomIndex = Math.floor(Math.random() * message.length);
    const message1 = message[randomIndex];
    api.sendMessage(message1, event.threadID, event.messageID);
  } else {
    data.shift();
    const completion = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: data.join(" ") }],
    });
    api.sendMessage(
      completion.data.choices[0].message["content"],
      event.threadID,
      event.messageID
    );
  }
};
