const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')
const adapter = new FileSync('db.json')
const db = low(adapter)

db.defaults({votes: {}}).write();

db.getVotes = ((username) =>{
  const a = db.get('votes').value()

  return a[username]
});

db.setVotes = (({username, votes}) => {
  db.set(`votes.${username}`, votes).write();
});

db.addVote = (({username, vote}) => {
  let votes = db.getVotes(username) || []
  votes.push(vote)
  db.setVotes({username, votes})
});

db.getTopCuisineType = () => {
  const votes = db.get('votes').value();

  const count = Object.keys(votes).reduce((finalCount, key) => {
    votes[key].forEach(cuisineType => {
      finalCount[cuisineType] = (finalCount[cuisineType] || 0) + 1;
    })

    return finalCount;
  }, {})


  let cuisineType = null;
  let bigger = 0;
  for(let key in count) {
    if (count[key] > bigger) {
      bigger = count[key];
      cuisineType = key;
    }
  }

  return cuisineType;
}

module.exports = db;
