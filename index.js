var path = require('path');
var bodyparser = require('body-parser');
var express = require('express');
var app = express();
var mongo = require('mongodb').MongoClient;
var url = 'mongodb://localhost:27017/'
var ObjectID = require('mongodb').ObjectID;

app.listen(5000);

app.use(bodyparser.urlencoded({extended: false}));
app.use(bodyparser.json());

app.use(express.static(path.join(__dirname,'static')));

app.get('/api/rsvp/', function(req, res){
  if(typeof req.query.email !== "string"){
    return res.send(null);
  }
  mongo.connect(url, function(err, client){
    if(err){throw err;}
    client.db('wedding').collection('rsvp').findOne({
      'people.email': req.query.email
    }, function(err, data){
      if(err){throw err;}
      res.send(data);
    });
  });
});

app.put('/api/rsvp', function(req, res){
  var id = req.body._id;
  if(typeof id !== "string"){
    return res.send(null);
  }
  delete req.body._id;
  mongo.connect(url, function(err, client){
    if(err){throw err;}
    client.db('wedding').collection('rsvp').findOneAndUpdate(
      {_id: new ObjectID(id)},
      req.body
      , function(err, data){
        if(err){throw err;}
        res.send();
      }
    );
  })
});
