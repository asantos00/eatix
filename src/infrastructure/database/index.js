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

db.getTopRestaurants = () => {
  return [
    {
      id: 1,
      votes: 4,
      name: 'Steffen\'s Restaurant',
      image: 'https://file.videopolis.com/D/9dc9f4ba-0b2d-4cbb-979f-fee7be8a4198/8485.11521.brussels.the-hotel-brussels.amenity.restaurant-AD3WAP2L-13000-853x480.jpeg',
      rating: 4,
    },
    {
      id: 2,
      votes: 3,
      name: 'KI Group\'s House',
      image: 'https://file.videopolis.com/D/9dc9f4ba-0b2d-4cbb-979f-fee7be8a4198/8485.11521.brussels.the-hotel-brussels.amenity.restaurant-AD3WAP2L-13000-853x480.jpeg',
      rating: 3,
    },
    {
      id: 3,
      votes: 2,
      name: 'Braun\'s',
      image: 'https://file.videopolis.com/D/9dc9f4ba-0b2d-4cbb-979f-fee7be8a4198/8485.11521.brussels.the-hotel-brussels.amenity.restaurant-AD3WAP2L-13000-853x480.jpeg',
      rating: 2,
    },
  ];
}

module.exports = db;
