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

app.get('/*', function(req,res) {
  res.sendFile(__dirname + '/dist/ChatApplicaton/index.html')
});

app.post('/getGroups', function(req, res) {

      var channelList;
      var groupName = req.body.groupName;

      fs.readFile('channel&Groups.json', 'utf-8', function(err,data){

        if(err) {

          console.log(err);

        } else {
          channelList = JSON.parse(data);
          //channelList.exists = false;
          for(let i = 0;i < channelList.length;i++){
            if(channelList[i].gName == groupName) {
              //channelList[i].exists = true;
              res.send(channelList[i]);
              return;
            }
          }
        }

        //res.send(channelList);
      });
})

app.post('/changeGroup', function(req, res) {

      var channelList;
      var groupName = req.body.group;

      fs.readFile('channel&Groups.json', 'utf-8', function(err,data){

        if(err) {

          console.log(err);

        } else {
          channelList = JSON.parse(data);
          //channelList.exists = false;
          for(let i = 0;i < channelList.length;i++){
            if(channelList[i].gName == groupName) {
              //channelList[i].exists = true;
              res.send(channelList[i]);
              return;
            }
          }
        }

        //res.send(channelList);
      });
})

app.post('/newRoom', function(req,res) {
  //console.log("Entered new room");
  fs.readFile('channel&Groups.json', 'utf-8', function(err,data){

    var groupsInfo;
    var newRoom = req.body.newRoom;
    var curGroup = req.body.curGroup;
    console.log(newRoom, curGroup);

    if(err) {

      console.log(err);

    } else {
      groupsInfo = JSON.parse(data);
      for(let i = 0;i < groupsInfo.length;i++){
        if(groupsInfo[i].gName == curGroup) {
          groupsInfo[i].channels.push(newRoom);
          console.log("pushed new channel " +newRoom);
          console.log(groupsInfo[i].channels);
        }
      }
      var newData = JSON.stringify(groupsInfo);
      console.log("New Data " + newData);
      fs.writeFile('channel&Groups.json', newData, 'utf-8', function(err) {

        if (err) {
          console.log(err);
        }
        console.log("A new room was created in the group " + newRoom);
        res.send(newRoom);
        //socket.emit('message', {type:'message', text:'SERVER: A new channel has been created: '+ newRoom});
      });
     }

  });
})

app.post('/newGroup', function(req,res) {
  var groupsInfo;
  var newGroup = req.body.newGroup;
  var curUser = req.body.curUser;
  var isGroup;
  fs.readFile('channel&Groups.json', 'utf-8', function(err,data){

    console.log(newGroup);

    if(err) {
      console.log(err);
    } else {
      groupsInfo = JSON.parse(data);
      for(let i = 0;i < groupsInfo.length; i++) {
        if(groupsInfo[i].gName == newGroup){
          isGroup = 1;
        }
      }
      if(isGroup > 0){
        res.send(alert("Group may already exist"));
        console.log("Group creation failed");

      } else {
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
  fs.readFile('authdata.json', 'utf-8', function(err,data){
    var userData;
    if(err) {
      console.log(err);
    } else {
      userData = JSON.parse(data);
      for(let i = 0;i < userData.length; i++) {
        if(userData[i].name == curUser){
          userData[i].groups.push(newGroup);
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

app.post('/addToGroup', function(req, res) {
  var newGroup = req.body.group;
  var curUser = req.body.user;

  fs.readFile('authdata.json', 'utf-8', function(err,data){
    var userData;
    if(err) {
      console.log(err);
    } else {
      userData = JSON.parse(data);
      for(let i = 0;i < userData.length; i++) {
        if(userData[i].name == curUser){
          userData[i].groups.push(newGroup);
          console.log(userData[i]);
        }
      }
      var newData = JSON.stringify(userData);
      console.log(newData);
      fs.writeFile('authdata.json', newData ,'utf-8', function(err) {
        if (err) throw err;
        res.send(true);


      })
    }
  });
})

app.post('/removeUserFromGroup', function(req, res) {
  var newGroup = req.body.group;
  var curUser = req.body.user;

  fs.readFile('authdata.json', 'utf-8', function(err,data){
    var userData;
    if(err) {
      console.log(err);
    } else {
      userData = JSON.parse(data);
      for(let i = 0;i < userData.length; i++) {
        if(userData[i].name == curUser){
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
        res.send(true);


      })
    }
  });
})

//NO GO ZONE
http.listen(3000,() => {
  console.log("Server Started...");
});
