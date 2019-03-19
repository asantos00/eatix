require('dotenv').config()

const createDelivery = require('./delivery');
const zomato = require('./infrastructure/zomato');
const db = require('./infrastructure/database');
const slack = require('./infrastructure/slack');

createDelivery({
  cuisinesClient: zomato,
  db,
  messageClient: slack,
});
