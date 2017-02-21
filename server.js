// dependencies
const express = require('express');
const mongodb = require('mongodb');

// environment variables
const port = process.env.PORT;
const mongoUrl = process.env.MONGODB_URI;

// server & db setup
const app = express();
var col;

// connect to the server
mongodb.MongoClient.connect(mongoUrl, (err, db) => {
  // handle error
  if (err) return console.log('Unable to connect to the mongoDB server. Error: ' + err);

  // report successful connection
  console.log('Connection established to mongoDB');
  
  // select collection
  col = db.collection('searches');
  
});

// setup static files
app.use(express.static(__dirname + '/public'));

// routing **

// 404 handling
app.use((req, res) => {
  res.status(404).sendFile(__dirname + '/public/404.html');
});

// start server
app.listen(port, () => console.log('Listening on port ' + port));