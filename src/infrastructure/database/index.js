const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')
const adapter = new FileSync('db.json')
const db = low(adapter)

db.defaults({votes: {}}).write();

db.getTopCuisineType = () => {
  const votes = db.get('votes').value();

  const count = Object.keys(votes).reduce((finalCount, key) => {
    votes[key].forEach(({ cuisineId }) => {
      finalCount[cuisineId] = (finalCount[cuisineId] || 0) + 1;
    })

    return finalCount;
  }, {})


  let cuisineId = null;
  let bigger = 0;

  for(let key in count) {
    if (count[key] > bigger) {
      bigger = count[key];
      cuisineId = key;
    }
  }

  return cuisineId;
}

db.getVotes = (username) =>{
  const a = db.get('votes').value()

  return a[username]
}

db.clearVotes = (username) => db.setVotes({ username, votes:[]})

db.setVotes  = ({username, votes}) => {
  db.set(`votes.${username}`, votes).write();
}

db.addVote = ({username, vote}) => {
  votes = db.getVotes(username) || []
  if (votes.length > 2){
    return
  }

  votes.push(vote)
  db.setVotes({username, votes})
}

module.exports = db;
