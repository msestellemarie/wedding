const path = require('path');
const bodyparser = require('body-parser');
const express = require('express');
const app = express();
const mongo = require('mongodb').MongoClient;
const url = 'mongodb://localhost:27017/'
const ObjectID = require('mongodb').ObjectID;
const nodemailer = require('nodemailer');
const config = {
  host: 'email-smtp.us-east-1.amazonaws.com',
  port: 465,
  secure: true,
  auth: {
    user: process.env.SMTP_USER || 'AKIAJDEJL3KSUEZHGV4A',
    pass: process.env.SMTP_PASS || 'Ak1mr1rUBxr+x4l4tZ2HoBuJJwOkCG7PoplrV7z9EYwd'
  }
}
const transporter = nodemailer.createTransport(config);

app.listen(5000);

app.use(bodyparser.urlencoded({extended: true}));
app.use(bodyparser.json());

app.use(express.static(path.join(__dirname,'static')));

app.get('/api/rsvp/', function(req, res){
  if(typeof req.query.email !== "string"){
    return res.json(null);
  }
  mongo.connect(url, function(err, client){
    if(err){throw err;}
    client.db('wedding').collection('rsvp').findOne({
      'people.email': req.query.email.toLowerCase().trim()
    }, function(err, data){
      if(err){throw err;}
      res.json(data);
    });
  });
});

app.put('/api/rsvp/', function(req, res){
  var id = req.body._id;
  if(typeof id !== "string"){
    return res.json(null);
  }
  delete req.body._id;
  mongo.connect(url, function(err, client){
    if(err){throw err;}
    client.db('wedding').collection('rsvp').findOneAndUpdate(
      {_id: new ObjectID(id)},
      req.body
      , function(err, data){
          if(err){throw err;}
          if(config.auth.user && config.auth.pass){
            transporter.sendMail(
              {
                from: '"Pete & Estelle" emso18@gmail.com',
                to: req.body.people.map(function(x){return x.email;}),
                subject: 'RSVP Confirmation',
                html: buildEmail(req.body)
              },
              function(err, data) {
                console.log(err, data);
                if(err){throw err;}
                res.json();
              }
            )
          }
      }
    );
  })
});

function buildEmail(obj){
  var email = obj.people[0].email;
  var dietary = obj.dietary || "N/A";
  var attendanceList = "";
  var attending = {
    true: "Attending",
    false: "Not attending"
  }
  for(var each in obj.people){
    attendanceList += `<br/>${obj.people[each].name}: ${attending[obj.people[each].attending]}`;
  }
  return `Hi,<br/><br/>

  Thanks for RSVP'ing to our wedding. You can see your selections below. If you'd like to update or change anything, you can <a href="http://localhost:5000/rsvp/" target="_blank">view your responses here</a>. Just make sure to have your final response submitted by September 20th, 2018.

  <br/><br/><b>Attendance List</b>
  ${attendanceList}
  <br/><br/><b>Dietary Restrictions</b>
  <br/>${dietary}

  <br/><br/>Thanks,
  <br/>Pete & Estelle`;
}
