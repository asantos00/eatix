const { WebClient } = require('@slack/client');

const web = new WebClient(process.env.SLACK_TOKEN);

exports.sendMessage = (args) => {
    return web.chat.postMessage(args);
}
