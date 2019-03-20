const Koa = require("koa");
const Router = require("koa-router");
const bodyParser = require("koa-bodyparser");
const accesslog = require('koa-accesslog');
const twilioBodyTemplate = require('./templates/twilio_calls');
const VoiceResponse = require('twilio').twiml.VoiceResponse;
const app = new Koa();
const router = new Router();
const baseurl = "http://26f51af0.ngrok.io"

module.exports = function create({ db, cuisinesClient, messageClient, twilioClient }) {

  router.post('/gather-twilio', async ctx => {
    const twiml = new VoiceResponse();

    const answer = ctx.request.body.SpeechResult.toLowerCase();
    if (answer) {
      switch (answer) {
        case 'yes.':
          twiml.say('Table is confirmed... fucker!');
          break;
        case 'no.':
          twiml.say('Thank you anyway!');
          break;
        default:
          twiml.say('Sorry, I don\'t understand that choice.');
          twiml.redirect(`${baseurl}/api/twilio-book`);
          break;
      }
    } else {
      // If no input was sent, redirect to the /voice route
      twiml.redirect(`${baseurl}/api/twilio-book`);
    }

    // Render the response as XML in reply to the webhook request
    ctx.type = 'application/xml'
    ctx.body = twiml.toString();
  });

  router.post("/twilio-book", async ctx => {
    const twiml = new VoiceResponse();

    // Use the <Gather> verb to collect user input
    const gather = twiml.gather({
      input: "speech",
      speechTimeout: "3",
      numDigits: 1,
      action: `${baseurl}/api/gather-twilio`,
    });
    // @todo make this dynamic
    gather.say('Hey you piss of shit! We would like to book a table for 3 guys to 1 PM. Say yes or no');
  
    // If the user doesn't enter input, loop
    twiml.redirect(`${baseurl}/api/twilio-book`);
  
    // Render the response as XML in reply to the webhook request
    ctx.type = 'application/xml'
    ctx.body = twiml.toString();
  });

  router.get("/twilio-call", async ctx => {
    const call = await twilioClient.calls.create({
       url: `${baseurl}/api/twilio-book`,
       to: '+351913429823',
       from: '+351308811593',
     });

    console.log(call.sid);

    ctx.status = 200;
  });

  router.get("/cuisines", async ctx => {
    const { lat, lon } = ctx.query;
    const cuisines = await cuisinesClient.getCuisines({ lat, lon });

    ctx.body = cuisines;
  });

  router.get("/votes", async ctx => {
    const votes = db.get("votes");

    ctx.body = votes;
  });

  router.get("/vote", async ctx => {
    const { cuisines, userId } = ctx.query;
    console.log(ctx);

    db.set(`votes.${userId}`, cuisines).write();

    ctx.status = 201;
  });

  // Receives incoming webhook from slack slash command
  router.post("/slack", async ctx => {
    const { text } = ctx.request.body;
    console.log(text);

    ctx.status = 200;
  });

  router.post("/slack/interact", async ctx => {
    const {
      actions: [action]
    } = JSON.parse(ctx.request.body.payload);
    console.log(action.selected_option.value);

    ctx.status = 200;
  });

  router.get("/test", async ctx => {
    const { lat, lon } = ctx.query;
    const { cuisines } = JSON.parse(
      await cuisinesClient.getCuisines({ lat, lon })
    );

    const res = await messageClient.sendMessage({
      channel: "GDLEEK01E",
      text: "Hello there",
      blocks: [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: "Hello, I'm *Eatix bot*. What are you up to eat today?"
          }
        },
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: "Pick a cuisine type from the list below"
          },
          accessory: {
            type: "static_select",
            action_id: "vote_cuisine",
            placeholder: {
              type: "plain_text",
              text: "Select an item",
              emoji: true
            },
            options: cuisines.map(
              ({
                cuisine: { cuisine_id: cuisineId, cuisine_name: cuisineName }
              }) => ({
                text: {
                  type: "plain_text",
                  text: cuisineName,
                  emoji: true
                },
                value: cuisineId.toString()
              })
            )
          }
        }
      ]
    });

    ctx.body = res;
  });

  app
    .use(accesslog())
    .use(bodyParser())
    .use(router.prefix('/api').routes())
    .use(router.allowedMethods())
    .listen(3000, () => console.log("Listening"));

  return app;
};
