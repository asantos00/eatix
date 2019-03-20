const Koa = require("koa");
const Router = require("koa-router");
const bodyParser = require("koa-bodyparser");
const accesslog = require("koa-accesslog");
const VoiceResponse = require("twilio").twiml.VoiceResponse;
const app = new Koa();
const router = new Router();
const baseurl = "https://f0b51c0f.ngrok.io";
const LISBON_LAT = 38.726197
const LISBON_LON = -9.135169

module.exports = function create({
  db,
  cuisinesClient,
  messageClient,
  twilioClient
}) {
   /**
   * @api {post} /gather-twilio Twilio voice webhook
   * @apiName VoiceWebhook
   * @apiVersion 1.0.0
   * @apiDescription Endpoint that receives the result of the twilio conversation with user
   * @apiGroup Slack
   *
   * @apiParam {String} SpeechResult Result of user's answer to the conversation
   *
   * @apiSuccess (200) Success
   */
  router.post("/gather-twilio", async ctx => {
    const twiml = new VoiceResponse();

    const answer = ctx.request.body.SpeechResult.toLowerCase();
    if (answer) {
      switch (answer) {
        case "yes.":
          twiml.say("Table is confirmed... Thank you, come again!");
          messageClient.sendConfirmedBookingMessage();
          break;
        case "no.":
          twiml.say("Thank you anyway!");
          break;
        default:
          twiml.say("Sorry, I don't understand that choice.");
          twiml.redirect(`${baseurl}/api/twilio-book`);
          break;
      }
    } else {
      // If no input was sent, redirect to the /voice route
      twiml.redirect(`${baseurl}/api/twilio-book`);
    }

    // Render the response as XML in reply to the webhook request
    ctx.type = "application/xml";
    ctx.body = twiml.toString();
  });

   /**
   * @api {post} /twilio-book Trigger twilio call
   * @apiName TriggerCall
   * @apiVersion 1.0.0
   * @apiDescription Trigger a twilio call to
   * @apiGroup Slack
   *
   * @apiParam {String} SpeechResult Result of user's answer to the conversation
   *
   * @apiSuccess (200) Success
   */
  router.post("/twilio-book", async ctx => {
    const twiml = new VoiceResponse();

    // Use the <Gather> verb to collect user input
    const gather = twiml.gather({
      input: "speech",
      speechTimeout: "3",
      numDigits: 1,
      action: `${baseurl}/api/gather-twilio`
    });

    // @todo make this dynamic
    gather.say(
      "Hey you piss of shit! We would like to book a table for 3 guys to 1 PM. Say yes or no"
    );

    // If the user doesn't enter input, loop
    twiml.redirect(`${baseurl}/api/twilio-book`);

    // Render the response as XML in reply to the webhook request
    ctx.type = "application/xml";
    ctx.body = twiml.toString();
  });

  router.get("/twilio-call", async ctx => {
    await twilioClient.calls.create({
      url: `${baseurl}/api/twilio-book`,
      to: "+351913429823",
      from: "+351308811593"
    });

    ctx.status = 200;
  });

  const commandUseCases = {
    "/eatix": async ctx => {
      ctx.body = {
        text: "What would you like to do?",
        blocks: [
          {
            type: "actions",
            block_id: "call",
            elements: [
              {
                type: "button",
                text: {
                  type: "plain_text",
                  text: "Book a table!",
                  emoji: true
                },
                value: "init_choices"
              },
              {
                type: "button",
                text: {
                  type: "plain_text",
                  text: "Book a table!",
                  emoji: true
                },
                value: "delete"
              }
            ]
          }
        ]
      };
    },
    "/poll": async ctx => {
      // const cuisineType = db.getTopCuisineType();
      messageClient.sendRestaurantMessage(
        {
          name: 'Braun\'s Restaurant',
          image: 'http://www.ki-performance.com/sites/default/files/styles/medium/public/2016-04/Steffen%20Braun%20Web.png?itok=9r7KPfiK',
          rating: 5,
          id: 1,
          description: 'The best restaurant in town from our dear CEO. Worth the try!',
          pricePerPerson: 15,
        },
        6
      );
      ctx.body = "";
    }
  };

   /**
   * @api {post} /slack Slash commands webhook
   * @apiName SlashWebhook
   * @apiVersion 1.0.0
   * @apiDescription Endpoint that receives slash command's webhooks
   * @apiGroup Slack
   *
   * @apiParam {String} command Selected option for the interaction
   *
   * @apiSuccess (200) Success
   */
  router.post("/slack", async ctx => {
    await commandUseCases[ctx.request.body.command](ctx);
  });

  /**
   * @api {post} /slack Interactions webhook
   * @apiName InteractionWebhook
   * @apiVersion 1.0.0
   * @apiDescription Endpoint that receives webhooks from slack and handles them
   * @apiGroup Slack
   *
   * @apiParam {String} payload.action.selected_option.value Selected option for the interaction
   *
   * @apiSuccess (200) Success
   */

  async function sendChoices({ id, username }) {
    const lat = LISBON_LAT, lon = LISBON_LON
    const { cuisines } = JSON.parse(await cuisinesClient.getCuisines({ lat, lon }));

    alreadyChoose = await db.getVotes(username) || []

    const response = {
      channel: id,
      text: 'Hello there',
      replace_original: true,
      response_type: "in_channel"
    }

    const blocks = []
    if (alreadyChoose.length == 0) {
blocks.push={
  "type": "section",
  "text": {
    "type": "mrkdwn",
    "text": "Hello, I'm *Eatix bot*. What are you up to eat today?" + alreadyChoose.length
  }
}
    }

    let title =""
    switch(alreadyChoose.length){
      case 0:
        title = "What is your preferred cuisine type for today?"
        break

      case 1:
        title = "But you could also go to:"
        break

      case 2:
      title = "Pick your last cuisine type"
      break
    }

    if (alreadyChoose.length < 3) {
      blocks.push([
        {
          "type": "section",
          "text": {
            "type": "mrkdwn",
            "text": title
          },
          "accessory": {
            "type": "static_select",
            "action_id": "vote_cuisine",
            "placeholder": {
              "type": "plain_text",
              "text": "Select an item",
              "emoji": true
            },
            "options": cuisines.map(({ cuisine: { cuisine_id: cuisineId, cuisine_name: cuisineName } }) => ({
              "text": {
                "type": "plain_text",
                "text": cuisineName,
                "emoji": true
              },
              //"value": cuisineId.toString(),
              "value": cuisineName
            }))
          }
        },
      ])
    }else{
      blocks = [{
        "type": "section",
        "text": {
          "type": "mrkdwn",
          "text": "Thanks for voting"
        }
      }]
    }

    if (alreadyChoose.length > 0) {
      blocks.push({
        "type": "context",
        "elements": [
          {
            "type": "mrkdwn",
            "text": "Already choose: " + alreadyChoose.join(", ")
          }
        ]
      })
    }

    response.blocks = blocks

    return response
  }


  const axios = require('axios');

  async function respond(responseUrl, message) {

    return axios.post(responseUrl, message,
      {
      }
    );
  }


  router.post('/slack/interact', async ctx => {
    const { response_url, actions: [action], channel: { id }, user: { username, id: userID } } = JSON.parse(ctx.request.body.payload);
    console.log(action.value)

    switch (action.value) {
      case "init_choices":
        console.log("init_choices")
        await messageClient.sendMessage(await sendChoices({ id, username: userID }))
        ctx.body = ""
        ctx.status = 200;

        break
      case "delete":
        db.clearVotes(userID)
        ctx.status = 200;
        ctx.body = ""

        break

      default:
        console.log(JSON.parse(ctx.request.body.payload))
        if((db.getVotes(userID) || []).length > 2) {
          ctx.status = 200;
          ctx.body = "";

          return
        }

        await db.addVote({ username: userID, vote: action.selected_option.value })


        ctx.status = 200;
        await messageClient.sendMessage(await sendChoices({ id, username: userID }))

        return
    }
    ctx.status = 200;
  })

  app
    .use(accesslog())
    .use(bodyParser())
    .use(router.prefix("/api").routes())
    .use(router.allowedMethods())
    .listen(process.env.PORT || 80, () => console.log("Listening"));

  return app;
};


