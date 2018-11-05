const express = require('express');
const bodyParser = require('body-parser');


const app = express();
app.use(bodyParser.json())
const PORT = 3000;
const database = {
  nextUser: 125,
  users : [
    {
      id: 123,
      name: 'John',
      email: 'john@gmail.com',
      password: 'cookies',
      entries: 0,
      joined: new Date()
    },
    {
      id: 124,
      name: 'Sally',
      email: 'sally@gmail.com',
      password: 'brownies',
      entries: 0,
      joined: new Date()
    },
  ]
}

app.get('/',(req, res) => {
  res.send(database.users)
})

app.post('/signin', (req, res) => {
  if (req.body.email === database.users[0].email &&
      req.body.password === database.users[0].password){
        res.json("SINGING IN")
      } else {
        res.status(400).json('error logging in')
      }
})

app.post('/register', (req, res) => {
  const {email, name, password} = req.body;
  database.users.push({
    id: database.nextUser,
    name: name,
    email: email,
    password: password,
    entries: 0,
    joined: new Date()
  })
  database.nextUser++;
  res.json(database.users[database.users.length-1])
})

app.get('/profile/:userID', (req, res) => {
  const {userID} = req.params;
  let found = false;
  database.users.forEach( (user)=>{
    if (user.id.toString() === userID) {
      found = true;
      return res.json(user);
    }
  })
  if(!found){
    res.status(404).json("USER NOT FOUND")
  }
})

app.post('/image', (req, res) => {
  const {id} = req.body;
  let found = false;
  database.users.forEach( (user)=>{
    if (user.id === id) {
      found = true;
      user.entries++;
      return res.json(user);
    }
  })
  if(!found){
    res.status(404).json("USER NOT FOUND")
  }
})

app.listen(PORT, ()=>{console.log(`SERVER IS RUNNING ON PORT ${PORT}`)});

