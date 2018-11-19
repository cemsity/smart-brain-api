const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require("bcrypt-nodejs");
const cors = require('cors');
const knex = require('knex');

const db = knex({
  client: 'pg',
  connection: {
    host : '127.0.0.1',
    user : 'postgres',
    password : 'test',
    database : 'smart-brain'
  }
});



const app = express();
app.use(bodyParser.json())
app.use(cors());

const PORT = 4000;

app.get('/',(req, res) => {
  res.send(database.users)
})

app.post('/signin', (req, res) => {
  db.select('email', 'hash').from('login')
    .where('email','=', req.body.email)
    .then(data => {
      const isValid = bcrypt.compareSync(req.body.password, data[0].hash)
      console.log(isValid);
      if (isValid){
        return db.select('*').from('users')
          .where('email', '=', req.body.email)
          .then(user => {
            res.json(user[0])
          })
          .catch(err => res.status(400).json('Unable to get users'))
      } else {
        res.status(400).json("worng Credentials");
      }
    })
    .catch( err => res.status(400).json("worng Credentials"))
})

app.post('/register', (req, res) => {
  const {email, name, password} = req.body;
  const hash = bcrypt.hashSync(password);
  db.transaction(trx => {
    trx.insert({
      hash: hash,
      email: email
    })
    .into('login')
    .returning('email')
    .then(loginEmail =>{
      return db('users')
        .returning('*')
        .insert({
          email: loginEmail[0],
          name: name,
          joined: new Date()
        })
        .then(user => {
          res.json(user[0])
        })
    })
    .then(trx.commit)
    .catch(trx.rollback)
  })
  .catch(err => res.status(400).json("UNABLE TO REGISTER"))
});

app.get('/profile/:id', (req, res) => {
  const {id} = req.params;
  db.select('*').from('users')
  .where({
    id: id
  })
  .then( user => {
    if (user.length) {
      res.json(user[0]);
    } else {
      res.status(400).json("Not FOund");
    }
  })
  .catch((err) => {
    res.status(400).json("NOT FOUND");
  })
});

app.put('/image', (req, res) => {
  const { id } = req.body;
  db('users').where('id', '=', req.body.id)
  .increment('entries', 1)
  .returning('entries')
  .then(entries => {
    res.json(entries[0]);
  })
  .catch(err => res.status(400).json("Unable to get entries"))
  // if(!found){
  //   res.status(404).json("USER NOT FOUND")
  // }
})


app.listen(PORT, ()=>{console.log(`SERVER IS RUNNING ON PORT ${PORT}`)});

