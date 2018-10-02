////////Establish the server////////
const express = require('express');
const app = express();
const path = require('path');
const http = require('http').Server(app);
const io = require('socket.io')(http);
const fs = require('fs');
const bodyParser = require("body-parser");

app.use(express.static(path.join('dist/ChatApplicaton')));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

var dbF = require('./dbFunctions.js')

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




http.listen(3000,() => {
  console.log("Server Started...");
});
////////Establish the server////////

//Sends back the view for the angular components
app.get('/*', function(req,res) {
  res.sendFile(__dirname + '/dist/ChatApplicaton/index.html')
});


app.post('/auth', (req,res) => {

  var uname = req.body.username;
  var upass = req.body.password;

  var userObj = dbF.FindRecord(mongod, uname, upass).then(result=>{
    if(result != "null"){
      res.send(result)

    } else {
      res.send(false);
    }

  });
  });

  app.post('/register', (req, res) => {

    var uname = req.body.username;
    var uemail = req.body.email;
    var upass = req.body.password;

    var userObj = {name: uname, password: upass, email:uemail};
    if(uname == '' || uemail == '' || upass == '' || uname == null || uemail == null || upass == null) {
      res.send(false);

    } else {
    var userData = dbF.FindRecord(mongod, uname, upass).then(result=> {
      if(result == "null") {
        dbF.AddUser(mongod, userObj);
        res.send(true);
      } else {
        res.send(false);
      }
    })
  }

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

    res.send(result);
  })

})

//Called when a user is removed from a group
app.post('/removeUserFromGroup', function(req, res) {
  var group = req.body.group; //Group name
  var user = req.body.user;   //the user being removed

  dbF.RemoveFromGroup(mongod, group, user).then(result=> {
    res.send(result);
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
      dbF.SetGroupAdmin(mongod, user, group).then(success => {
        res.send(success);
      })

    })

  })

//Called when setting a user to a super admin
  app.post('/setAdmin',function(req, res) {
    var user = req.body.user; //Users name
    var permissionsLevel = 3;

    dbF.SetAdmin(mongod, user, permissionsLevel).then(result=> {
      res.send(true);
    })

  })

//Called when removing and group from the system
  app.post('/removeGroup', function(req, res) {
    var group = req.body.group; //Name of the group

    dbF.RemoveGroup(mongod, group).then(result=> {

      for(var i = 0; i < result.users.length; i++) {
        dbF.RemoveFromGroup(mongod, group, result.users[i]).then(res=> {
        });
      }
      for(var i = 0; i < result.channels.length; i++) {
        dbF.RemoveChannelHistory(mongod,result.channels[i]).then(res=> {
        });
      }

      res.send(true);
    })

  })

  app.post('/getChatHistory', function(req, res) {
    var channel = req.body.channel;

    dbF.GetChannelHistory(mongod, channel).then(result=> {
      res.send(result);
    })
  })

//Called when removing a channel from a group
  app.post('/removeChannel', function(req, res) {
    var group = req.body.group; // Name of the group
    var channel = req.body.channel; // Name of the channel to be removed

    dbF.RemoveRoom(mongod, group, channel).then(result=> {
      res.send(true);
    })

  })

  app.post('/uploadFile', function(req, res) {
    var user = req.body.user;
    var image = req.body.file;


    dbF.AvatarUpdate(mongod, user, image).then(result=> {
      res.send(true);
    })
  })
