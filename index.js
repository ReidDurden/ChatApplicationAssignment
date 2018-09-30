////////Establish the server////////
const express = require('express');
const app = express();
const path = require('path');
const http = require('http').Server(app);
const io = require('socket.io')(http);
const fs = require('fs');
const bodyParser = require("body-parser");
//const formidable = require('formidable');

app.use(express.static(path.join('dist/ChatApplicaton')));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//require('./socket.js')(app, io, fs);
//require('./auth.js')(app,fs);
//require('./register.js')(app,fs);
var dbF = require('./dbFunctions.js')
//require('./socket.js')(app, io, fs);

const MongoClient = require('mongodb').MongoClient;
const url = 'mongodb://localhost:27017';
var mongod;


MongoClient.connect(url, {poolSize:10}, function(err,client) {
  if (err) {return console.log(err)}
  const dbName = 'ChatApp';
  const db = client.db(dbName);
  mongod = db;
  require('./socket.js')(app, io, fs, mongod);


  dbF.DBinit(db).then(result=>{
      console.log("Completed");
    })
});

//require('./socket.js')(app, io, fs, mongod);



http.listen(3000,() => {
  console.log("Server Started...");
});
////////Establish the server////////

//Sends back the view for the angular components
app.get('/*', function(req,res) {
  res.sendFile(__dirname + '/dist/ChatApplicaton/index.html')
});

//
app.post('/auth', (req,res) => {

  var uname = req.body.username;
  var upass = req.body.password;

  var userObj = dbF.FindRecord(mongod, uname, upass).then(result=>{
    if(result != "null"){
      res.send(result)

    } else {
      console.log("There was no result found sorry.");
      res.send(false);
    }

  });
  });

  app.post('/register', (req, res) => {

    var uname = req.body.username;
    var uemail = req.body.email;
    var upass = req.body.password;

    var userObj = {name: uname, password: upass, email:uemail};
    var userData = dbF.FindRecord(mongod, uname, upass).then(result=> {
      if(result == "null") {
        dbF.AddUser(mongod, userObj);
        res.send(true);
      } else {
        res.send(false);
        console.log("The user registration failed");
      }
    })

  });


//Is called when the user asks for their groups channels
app.post('/getGroups', function(req, res) {

      var groupName = req.body.groupName;
      var channelList = dbF.GetGroups(mongod, groupName).then(result=> {
        res.send(result);
      });


})

//Is called when a user wishs to change groups
app.post('/changeGroup', function(req, res) {

  var groupName = req.body.group;

  var channelList = dbF.ChangeGroups(mongod, groupName).then(result=> {
    console.log(result);
    res.send(result);
  });

})

//Called when a user wishs to create a new room
app.post('/newRoom', function(req,res) {

    var groupsInfo; //Info for the group
    var newRoom = req.body.newRoom; //New room name
    var curGroup = req.body.curGroup; //Group that the room will be made in

    var room = dbF.NewRoom(mongod, curGroup, newRoom).then(result=> {
      res.send(newRoom);
    });

})

//Is called when the user wishs to create a new group
app.post('/newGroup', function(req,res) {
  var groupsInfo; //Groups object storage
  var newGroup = req.body.newGroup; //New groups name
  var curUser = req.body.curUser; //User who created the group

  var newGroupTemp = dbF.CreateNewGroup(mongod, newGroup, curUser).then(result=> {
    if(result == false){
      res.send(alert("Group may already exist"));
    } else {

      dbF.AddToGroup(mongod, newGroup, curUser).then(returnedVal=> {
        res.send(newGroup);
      })
    }
  })

})

//Called when a user wishs to add a user to a group
app.post('/addToGroup', function(req, res) {
  var group = req.body.group; //Group name
  var user = req.body.user; //User being added

  dbF.AddToGroup(mongod, group, user).then(result=> {
    res.send(true);
  })

})

//Called when a user is removed from a group
app.post('/removeUserFromGroup', function(req, res) {
  var group = req.body.group; //Group name
  var user = req.body.user;   //the user being removed

  dbF.RemoveFromGroup(mongod, group, user).then(result=> {
    res.send(true);
  })

})

//Called to remove a user from the system
app.post('/removeUser', function(req, res) {
  var user = req.body.user; //Name of user

  dbF.RemoveUser(mongod, user).then(result=> {
    res.send(true);
  })

})

// Called when setting a user as a group admin
  app.post('/setGroupAdmin', function(req, res) {
    var user = req.body.user; //Name of user
    var group = req.body.group; //Name of group they are becoming admin of
    var permissionsLevel = 2;

    dbF.SetAdmin(mongod, user, permissionsLevel).then(result=> {
      //res.send(true);
      dbF.SetGroupAdmin(mongod, user, group).then(success => {
        res.send(true);
      })

    })

  })

//Called when setting a user to a super admin
  app.post('/setAdmin',function(req, res) {
    var user = req.body.user; //Users name
    console.log(user);
    var permissionsLevel = 3;

    dbF.SetAdmin(mongod, user, permissionsLevel).then(result=> {
      res.send(true);
    })

  })

//Called when removing and group from the system
  app.post('/removeGroup', function(req, res) {
    var group = req.body.group; //Name of the group

    dbF.RemoveGroup(mongod, group). then(result=> {
      console.log(result.length);
      console.log("Above is the users");
      for(var i = 0; i < result.length; i++) {
        console.log("ENTER THE LOOP");
        dbF.RemoveFromGroup(mongod, group, result[i]).then(res=> {
          console.log("Group was removed from a user");
        });
      }
      console.log("The group has been erased");
      console.log("RES TRUE");
      res.send(true);
    })

  })

//Called when removing a channel from a group
  app.post('/removeChannel', function(req, res) {
    var group = req.body.group; // Name of the group
    var channel = req.body.channel; // Name of the channel to be removed

    dbF.RemoveRoom(mongod, group, channel).then(result=> {
      console.log("Removed Channel");
      res.send(true);
    })

  })

  app.post('/uploadFile', function(req, res) {
    var user = req.body.user;
    var image = req.body.file;

    console.log(req.body);
    console.log(image);

    dbF.AvatarUpdate(mongod, user, image).then(result=> {
      console.log("Avatar has been updated");
      res.send(true);
    })


})
