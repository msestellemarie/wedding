const path = require('path');
const bodyparser = require('body-parser');
const express = require('express');
const app = express();
const mongo = require('mongodb').MongoClient;
const url = process.env.MONGO_URL || 'mongodb://localhost:27017/';
const database = process.env.MONGO_DATABASE || 'wedding';
const collection = process.env.MONGO_COLLECTION || 'rsvp';
const ObjectID = require('mongodb').ObjectID;
const nodemailer = require('nodemailer');
const config = {
  host: 'email-smtp.us-east-1.amazonaws.com',
  port: 465,
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
}
const transporter = nodemailer.createTransport(config);
const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || 'http://localhost:5000';

app.use(bodyparser.urlencoded({extended: true}));
app.use(bodyparser.json());

app.use(express.static(path.join(__dirname,'static')));

app.get('/api/rsvp/', function(req, res){
  if(typeof req.query.email !== "string"){
    return res.json(null);
  }
  mongo.connect(url, function(err, client){
    if(err){throw err;}
    client.db(database).collection(collection).findOne({
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
    client.db(database).collection(collection).findOneAndUpdate(
      {_id: new ObjectID(id)},
      req.body
      , function(err, data){
          if(err){throw err;}
          var to = req.body.people.map(function(x){return x.email;});
          var html = buildEmail(req.body);
          if(config.auth.user && config.auth.pass){
            console.log(`\nSending email to "${to.join(', ')}":\n${html}\n\n`);
            transporter.sendMail(
              {
                from: '"Pete & Estelle" emso18@gmail.com',
                to: to,
                bcc: 'emso18@gmail.com, petecorey@gmail.com',
                subject: 'RSVP Confirmation',
                html: html
              },
              function(err, data) {
                if(err){throw err;}
                res.json();
              }
            )
          }
          else {
            console.log(`\nNot sending email to "${to.join(', ')}":\n${html}\n\n`);
            console.log(config.auth.user, config.auth.pass);
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
    attendanceList += `<br/>${obj.people[each].name || "Plus one"}: ${attending[obj.people[each].attending]}`;
  }
  return `Hi,<br/><br/>

  Thanks for RSVP'ing to our wedding. You can see your selections below. If you'd like to update or change anything, you can <a href="${HOST}/rsvp/" target="_blank">view your responses here</a>. Just make sure to have your final response submitted by September 20, 2018.

  <br/><br/><b>Attendance List</b>
  ${attendanceList}
  <br/><br/><b>Dietary Restrictions</b>
  <br/>${dietary}

  <br/><br/>Thanks,
  <br/>Pete & Estelle`;
}

app.listen(PORT, function(err, res) {
  if (err) {
    console.error("Unable to start server:", err);
  }
  else {
    console.log(`Listening on ${PORT}.`);
  }
});
