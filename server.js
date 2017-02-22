// dependencies
const express = require('express');
const mongodb = require('mongodb');
const requestify = require('requestify');

// environment variables
const port = process.env.PORT;
const mongoUrl = process.env.MONGODB_URI;
const pixKey = process.env.PIXABAY_API;

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

// routing

// recent searches route
app.get('/latest-searches', (req, res) => {
  col.find({}, {'_id': 0}).sort({_id:-1}).limit(10).toArray((err, docs) => {
    if (err) {
      console.log(err);
      res.json({error: "Could not access Database"});
    } else {
      res.json(docs);
    }
  });
});

// image search route
app.get('/:search', (req, res) => {
  // query params for search
  var options = {
    params: {
      key: pixKey,
      q: req.params.search,
      page: req.query.page || 1,
      per_page: 10
    }
  };
  // send request
  requestify.get('https://pixabay.com/api/', options)
    .then(apiRes => {
      // record search in db
      col.insert({
        search: req.params.search,
        time: new Date().toString()
      });
      // extract useful info
      var output = [];
      apiRes.getBody().hits.forEach(img => {
        output.push({
          type: img.type,
          tags: img.tags,
          views: img.views,
          likes: img.likes,
          pageURL: img.pageURL
        });
      });
      // send JSON to client
      res.json(output);
    }).fail(apiRes => {
      console.log(apiRes.getCode());
      res.json({error: 'Search Failed'});
    }
  );
});

// 404 handling
app.use((req, res) => {
  res.status(404).sendFile(__dirname + '/public/404.html');
});

// start server
app.listen(port, () => console.log('Listening on port ' + port));