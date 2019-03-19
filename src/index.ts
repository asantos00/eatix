import * as Koa from 'koa';
import * as Router from 'koa-router';

import * as ZomatoClient from './infrastructure/zomato/index'

const app = new Koa();
const router = new Router();

router.get('/cuisines', async (ctx: any) => {
  ctx.body = 'cenas'

  console.log(new ZomatoClient())
});

app
  .use(router.routes())
  .use(router.allowedMethods());

app.listen(3000, () => console.log('Listening...'));
