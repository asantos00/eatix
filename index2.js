const zomato  = require('zomato');
const util = require('util');
const Koa = require('koa');
const Router = require('koa-router');

const client = zomato.createClient({
    userKey: '88034a0b3c7710bbbf65443ccb8fea3d'
})

const getCuisines = util.promisify(client.getCuisines);

const app = new Koa();
const router = new Router();

router.get('/cuisines', async (ctx) => {
  ctx.body = 'cenas'
  const cuisines = await getCuisines({ lat: 38.7213041, lon: -9.1543533 })

  console.log(cuisines)
});

app
  .use(router.routes())
  .use(router.allowedMethods());

app.listen(3000, () => console.log('Listening...'));
