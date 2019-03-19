const Koa = require('koa');
const Router = require('koa-router');
const bodyParser = require('koa-bodyparser');
const zomato = require('./infrastructure/zomato');
const { IncomingWebhook, WebClient } = require('@slack/client');

const app = new Koa();
const router = new Router();

const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')
const adapter = new FileSync('db.json')
const db = low(adapter)
app.context.db = db;
db.defaults({votes: {}}).write();

require('dotenv').config()

router.get('/cuisines', async (ctx) => {
  const { lat, lon } = ctx.query;
  const cuisines = await zomato.getCuisines({ lat, lon })

  ctx.body = cuisines;
});


router.get('/votes', async (ctx) => {
  const votes = db.get('votes');

  ctx.body = votes;
})

// TODO: change to post
router.get('/vote', async (ctx) => {
  const { cuisines, userId } = ctx.query;
  console.log(cuisines, userId);

  db.set(`votes.${userId}`, cuisines).write();

  ctx.status = 201;
});

// Receives incoming webhook from slack slash command
router.post('/slack', async (ctx) => {
  const { text } = ctx.request.body;
  console.log(ctx.request.body);

  ctx.status = 200;
})

router.post('/slack/interact', async ctx => {
  const { actions: [action] } = JSON.parse(ctx.request.body.payload);
  console.log(action.selected_option.value);

  ctx.status = 200;
})

router.get('/test', async ctx => {
  // An access token (from your Slack app or custom integration - xoxp, xoxb)
  const token = process.env.SLACK_TOKEN;
  const web = new WebClient(token);
  // This argument can be a channel ID, a DM ID, a MPDM ID, or a group ID
  const channel = 'GDLEEK01E';

  const { lat, lon } = ctx.query;
  const { cuisines } = JSON.parse(await zomato.getCuisines({ lat, lon }));

  const res = await web.chat.postMessage({
    channel,
    text: 'Hello there',
    blocks: [
      {
        "type": "section",
        "text": {
          "type": "mrkdwn",
          "text": "Hello, I'm *Eatix bot*. What are you up to eat today?"
        }
      },
      {
        "type": "section",
        "text": {
          "type": "mrkdwn",
          "text": "Pick a cuisine type from the list below"
        },
        "accessory": {
          "type": "static_select",
          "action_id": "vote_cuisine",
          "placeholder": {
            "type": "plain_text",
            "text": "Select an item",
            "emoji": true
          },
          "options": cuisines.map(({ cuisine: { cuisine_id: cuisineId, cuisine_name: cuisineName }}) => ({
              "text": {
                "type": "plain_text",
                "text": cuisineName,
                "emoji": true
              },
              "value": cuisineId,
          }))
        }
      }
    ],
  });

  ctx.body = res;
})


app.use(bodyParser())
  .use(router.routes())
  .use(router.allowedMethods())
  .listen(3000, () => console.log('Listening'))


function sendMessageToSlack (message) {
  const url = process.env.SLACK_WEBHOOK_URL;
  const webhook = new IncomingWebhook(url);
  webhook.send(message, function(err, res) {
    if (err) {
        console.log('Error:', err);
    } else {
        console.log('Message sent: ', res);
    }
  });
}
