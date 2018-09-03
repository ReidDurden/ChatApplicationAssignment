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
require('./auth.js')(app,fs);
require('./register.js')(app,fs);
////////Establish the server////////

//Sends back the view for the angular components
app.get('/*', function(req,res) {
  res.sendFile(__dirname + '/dist/ChatApplicaton/index.html')
});

//Is called when the user asks for their groups channels
app.post('/getGroups', function(req, res) {

      var channelList;
      var groupName = req.body.groupName;

//Read from storage and store the users channels
      fs.readFile('channel&Groups.json', 'utf-8', function(err,data){

        if(err) {

          console.log(err);

        } else {
          channelList = JSON.parse(data);
          for(let i = 0;i < channelList.length;i++){
            if(channelList[i].gName == groupName) {
//Send the channels back to the user
              res.send(channelList[i]);
              return;
            }
          }
        }

      });
})

//Is called when a user wishs to change groups
app.post('/changeGroup', function(req, res) {

      var channelList;
      var groupName = req.body.group;

//Retrieve the users groups and then send them the updated channel list
// for that group
      fs.readFile('channel&Groups.json', 'utf-8', function(err,data){

        if(err) {

          console.log(err);

        } else {
          channelList = JSON.parse(data);
          for(let i = 0;i < channelList.length;i++){
            if(channelList[i].gName == groupName) {
              res.send(channelList[i]);
              return;
            }
          }
        }

      });
})

//Called when a user wishs to create a new room
app.post('/newRoom', function(req,res) {
  fs.readFile('channel&Groups.json', 'utf-8', function(err,data){

    var groupsInfo; //Info for the group
    var newRoom = req.body.newRoom; //New room name
    var curGroup = req.body.curGroup; //Group that the room will be made in

    if(err) {

      console.log(err);

    } else {
      groupsInfo = JSON.parse(data);
      for(let i = 0;i < groupsInfo.length;i++){
        if(groupsInfo[i].gName == curGroup) {
          groupsInfo[i].channels.push(newRoom);
        }
      }
      var newData = JSON.stringify(groupsInfo);
      fs.writeFile('channel&Groups.json', newData, 'utf-8', function(err) {

        if (err) {
          console.log(err);
        }
        res.send(newRoom); //Once the file has been updated the newRoom
                           // is send back to the user
      });
     }

  });
})

//Is called when the user wishs to create a new group
app.post('/newGroup', function(req,res) {
  var groupsInfo; //Groups object storage
  var newGroup = req.body.newGroup; //New groups name
  var curUser = req.body.curUser; //User who created the group
  var isGroup; //Value for determining if the group already exists
  fs.readFile('channel&Groups.json', 'utf-8', function(err,data){

    console.log(newGroup);

    if(err) {
      console.log(err);
    } else {
      groupsInfo = JSON.parse(data);
      for(let i = 0;i < groupsInfo.length; i++) { //Checks if the group already exists
        if(groupsInfo[i].gName == newGroup){
          isGroup = 1;
        }
      }
      if(isGroup > 0){ //Informs the user the group already exists
        res.send(alert("Group may already exist"));
        console.log("Group creation failed");

      } else { //Add the group to the groups data and tell the user
               // the group was made successfully
        groupsInfo.push({"gName":newGroup,"channels":[],"admins":[curUser]});
        var newData = JSON.stringify(groupsInfo);

        fs.writeFile('channel&Groups.json', newData, 'utf-8', function(err) {

          if (err) throw err;
          console.log("New Group created: " + newGroup);
          res.send(newGroup);

        });
      }
     }
  });
  //Pulls the data of the user that made the group
  fs.readFile('authdata.json', 'utf-8', function(err,data){
    var userData;
    if(err) {
      console.log(err);
    } else {
      userData = JSON.parse(data);
      for(let i = 0;i < userData.length; i++) { //Find the user and then adds
        if(userData[i].name == curUser){        // the new group to the list of
          userData[i].groups.push(newGroup);    // groups that user is in.
          console.log(userData[i]);
        }
      }
      var newData = JSON.stringify(userData);
      console.log(newData);
      fs.writeFile('authdata.json', newData ,'utf-8', function(err) {
        if (err) throw err;

      })
    }
  });

})

//Called when a user wishs to add a user to a group
app.post('/addToGroup', function(req, res) {
  var newGroup = req.body.group; //Group name
  var curUser = req.body.user; //User being added

  fs.readFile('authdata.json', 'utf-8', function(err,data){ //Pull user data
    var userData;
    if(err) {
      console.log(err);
    } else {
      userData = JSON.parse(data);
      for(let i = 0;i < userData.length; i++) { //Find user and add new group
        if(userData[i].name == curUser){        // to their groups list
          userData[i].groups.push(newGroup);
          console.log(userData[i]);
        }
      }
      var newData = JSON.stringify(userData);
      console.log(newData);
      fs.writeFile('authdata.json', newData ,'utf-8', function(err) {
        if (err) throw err;
        res.send(true); // Confirm the user was added to the group


      })
    }
  });
})

//Called when a user is removed from a group
app.post('/removeUserFromGroup', function(req, res) {
  var newGroup = req.body.group; //Group name
  var curUser = req.body.user;   //the user being removed

  fs.readFile('authdata.json', 'utf-8', function(err,data){ //Retrieve user data
    var userData;
    if(err) {
      console.log(err);
    } else {
      userData = JSON.parse(data);
      for(let i = 0;i < userData.length; i++) { // Find the group in the users current groups
        if(userData[i].name == curUser){        // and remove it
          var userGroups = userData[i].groups
          for(let b = 0; b < userGroups.length; b++){
            if(userGroups[b] == newGroup) {
              userGroups.splice(b, 1);
            }
          }
          userData[i].groups = userGroups;
        }
      }
      var newData = JSON.stringify(userData);
      fs.writeFile('authdata.json', newData ,'utf-8', function(err) {
        if (err) throw err;
        console.log("Written to file");
        res.send(true); //Inform the user that the user was removed from the group


      })
    }
  });
})

//Called to remove a user from the system
app.post('/removeUser', function(req, res) {
  var user = req.body.user; //Name of user
  fs.readFile('authdata.json', 'utf-8', function(err,data) { //Retrieve user data
    var userData;
    if(err) {
      console.log(err);
    } else {
      userData = JSON.parse(data);

      for(let i = 0; i < userData.length; i++){ //Find user in the users list
        if(userData[i].name == user){           // and remove them
          userData.splice(i, 1);
        }
      }
      var newData = JSON.stringify(userData);
      fs.writeFile('authdata.json', newData, 'utf-8', function(err) {
        if(err) throw err;
        res.send(true); // Return successfully removed
      });
    }
  });
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

//Makes the server listen for any request to port 3000
http.listen(3000,() => {
  console.log("Server Started...");
});
