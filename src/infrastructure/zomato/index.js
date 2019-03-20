const zomato  = require('zomato');
const util = require('util');

const client = zomato.createClient({
    userKey: '88034a0b3c7710bbbf65443ccb8fea3d'
})

exports.getCuisines = util.promisify(client.getCuisines);
exports.search = util.promisify(client.search)
