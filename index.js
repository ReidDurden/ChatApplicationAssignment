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

require('./socket.js')(app, io, fs);
//require('./auth.js')(app,fs);
//require('./register.js')(app,fs);
var dbF = require('./dbFunctions.js')

const MongoClient = require('mongodb').MongoClient;
const url = 'mongodb://localhost:27017';
var mongod;


MongoClient.connect(url, {poolSize:10}, function(err,client) {
  if (err) {return console.log(err)}
  const dbName = 'ChatApp';
  const db = client.db(dbName);
  mongod = db;

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

//
app.post('/auth', (req,res) => {

  var uname = req.body.username;

  var userObj = dbF.FindRecord(mongod, uname).then(result=>{
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

    var userObj = {name: uname, email:uemail};
    var userData = dbF.FindRecord(mongod, uname).then(result=> {
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

    fs.readFile('channel&Groups.json', 'utf-8', function(err,data) { //Retrieve group info
      var groupData;
      if(err) {
        console.log(err);
      } else {
        groupData = JSON.parse(data);

        for(let i = 0; i < groupData.length; i++) { //Find the group and append
          if(groupData[i].gName == group) {         // the user to the list of admins
            groupData[i].admins.push(user);
          }
        }
        var newData = JSON.stringify(groupData);
        fs.writeFile('channel&Groups.json', newData,'utf-8', function(err, data) {
          if(err) throw err;
          //res.send(true);
        });
        fs.readFile('authdata.json', 'utf-8', function(err,data) { // Retrieve user data
          var userData;
          if(err) {
            console.log(err);
          } else {
            userData = JSON.parse(data);

            for (let i = 0; i < userData.length; i++) { // Find user and update there
              if(userData[i].name == user) {            // permissions to group admin
                if(userData[i].permissions !== 3) {
                  userData[i].permissions = 2;
                }
              }
            }
            var newData = JSON.stringify(userData);
            fs.writeFile('authdata.json', newData, 'utf-8', function(err, data) {
              if(err) throw err;
              res.send(true); // Return success
            })
          }
        })
      }
    })
  })

//Called when setting a user to a super admin
  app.post('/setAdmin',function(req, res) {
    var user = req.body.user; //Users name

    fs.readFile('authdata.json', "utf-8", function(err,data) { //Retrieve user data
      var userData;
      if(err) {
        console.log(err);
      } else {
        userData = JSON.parse(data);

        for(let i = 0; i < userData.length; i++) { //Find the user in the user data
          if(userData[i].name == user) {           // and update there permissiosn to
            userData[i].permissions = 3;           // group admin
          }
        }
        var newData = JSON.stringify(userData);
        fs.writeFile('authdata.json', newData, 'utf-8', function(err, data) {
          if(err) throw err;
          res.send(true); // Return true
        })
      }
    })
  })

//Called when removing and group from the system
  app.post('/removeGroup', function(req, res) {
    var group = req.body.group; //Name of the group

    fs.readFile('channel&Groups.json', 'utf-8', function(err,data) { //Retrieve group data
      var groupData;
      if(err) {
        console.log(err);
      } else {
        groupData = JSON.parse(data);

        for(let i = 0; i < groupData.length; i++) { //Find the groups data, and remove
          if(groupData[i].gName == group) {         // from the group data object
            groupData.splice(i, 1);
          }
        }
        var newData = JSON.stringify(groupData);
        fs.writeFile('channel&Groups.json', newData, 'utf-8', function(err, data) {
          if(err) throw err;
          //res.send(true);
        })
      }
    })
    fs.readFile('authdata.json', 'utf-8', function(err,data) { //Retrieve user data
      var userData;
      if(err) {
        console.log(err);
      } else {
        userData = JSON.parse(data);

        for(let i = 0; i < userData.length; i++) { //Search through each users data and
          var userGroups = userData[i];            // remove the group that was deleted
          for(let c = 0; c < userGroups.groups.length; c++) { // from any user that was a member
            if(userGroups.groups[c] == group){     //of that group
              userGroups.groups.splice(c, 1);
              userData[i] = userGroups;
            }
          }
        }
        var newData = JSON.stringify(userData);
        fs.writeFile('authdata.json', newData, 'utf-8', function(err,data) {
          if(err) throw err;
          res.send(true); // Return success
        })

      }
    })
  })

//Called when removing a channel from a group
  app.post('/removeChannel', function(req, res) {
    var group = req.body.group; // Name of the group
    var channel = req.body.channel; // Name of the channel to be removed

    fs.readFile('channel&Groups.json', 'utf-8', function(err, data) { //Pull group data
      var groupInfo;
      if(err) {
        console.log(err);
      } else {
        groupData = JSON.parse(data);
        for(let i = 0; i < groupData.length; i++) { //Find the groups data in the object
          if(groupData[i].gName == group){          // and remove that channel from the
            var chGroup = groupData[i];             // channels list
            for(let c = 0; i < chGroup.channels.length; c++) {
              if(chGroup.channels[c] == channel){
                chGroup.channels.splice(c, 1);
                groupData[i] = chGroup;
              }
            }
          }
        }
        var newData = JSON.stringify(groupData);
        fs.writeFile('channel&Groups.json', newData, 'utf-8', function(err, data) {
          if(err) throw err;
          res.send(true); //Return true
        })
      }
    })
  })
