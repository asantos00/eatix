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
  router.post("/gather-twilio", async ctx => {
    const twiml = new VoiceResponse();

    const answer = ctx.request.body.SpeechResult.toLowerCase();
    if (answer) {
      switch (answer) {
        case "yes.":
          twiml.say("Table is confirmed... fucker!");
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
    db.set(`votes.${userId}`, cuisines).write();

    ctx.status = 201;
  });

  const commandUseCases = {
    "/eatix": async ctx => {
      ctx.body = {
        text: "What would you like to do?",
        attachments: [
          {
            color: "#3AA3E3",
            attachment_type: "default",
            callback_id: "wopr_game",
            actions: [
              {
                name: "init_choices",
                text: "Choose Cuisines",
                type: "button",
                value: "chess"
              },
              {
                name: "delete",
                text: "Delete Choices",
                style: "danger",
                type: "button",
                value: "war",
                confirm: {
                  title: "Are you sure?",
                  text: "Are you sure you want to clear your choices?",
                  ok_text: "Yes",
                  dismiss_text: "No"
                }
              }
            ]
          }
        ]
      };
    },
    "/poll": async ctx => {
      const restaurants = db.getTopRestaurants();
      messageClient.sendRestaurantsMessage(restaurants);
      ctx.body = "";
    }
  };

  // Receives incoming webhook from slack slash command
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
  router.post("/slack/interact", async ctx => {
    const {
      actions: [action],
      channel: { id },
      user: { id: userID }
    } = JSON.parse(ctx.request.body.payload);
    switch (action.name) {
      case "init_choices":
        await sendChoices({ id });
        break;
      default:
        db.addVote({ username: userID, vote: action.selected_option.value });
    }
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

  async function sendChoices({ id }) {
    const lat = LISBON_LAT, lon = LISBON_LON;
    const { cuisines } = JSON.parse(
      await cuisinesClient.getCuisines({ lat, lon })
    );

    await messageClient.sendMessage({
      channel: id,
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
                cuisine: { cuisine_name: cuisineName }
              }) => ({
                text: {
                  type: "plain_text",
                  text: cuisineName,
                  emoji: true
                },
                //"value": cuisineId.toString(),
                value: cuisineName
              })
            )
          }
        },
        {
          type: "context",
          elements: [
            {
              type: "mrkdwn",
              text: "Already choose: "
            }
          ]
        }
      ]
    });
  }

  app
    .use(accesslog())
    .use(bodyParser())
    .use(router.prefix("/api").routes())
    .use(router.allowedMethods())
    .listen(process.env.PORT || 80, () => console.log("Listening"));

  return app;
};
