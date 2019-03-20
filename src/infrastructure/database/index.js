const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')
const adapter = new FileSync('db.json')
const db = low(adapter)

db.defaults({votes: {}}).write();


db.getVotes = (username) =>{
  const a = db.get('votes').value()

  return a[username]
}

db.setVotes = ({username, votes}) => {
  db.set(`votes.${username}`, votes).write();
}

db.addVote = ({username, vote}) => {
  votes = db.getVotes(username) || []
  votes.push(vote)
  db.setVotes({username, votes})
}

module.exports = db;
