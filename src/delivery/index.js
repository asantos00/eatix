const Koa = require("koa");
const Router = require("koa-router");
const bodyParser = require("koa-bodyparser");

const app = new Koa();
const router = new Router();

module.exports = function create({ db, cuisinesClient, messageClient }) {
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
    .use(bodyParser())
    .use(router.routes())
    .use(router.allowedMethods())
    .listen(3000, () => console.log("Listening"));

  return app;
};
