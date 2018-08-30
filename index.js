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

app.post('getGroups', function(req, res) {

      var channelList;
      var groupName = req.body.groupname;

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

        res.send(channelList);
      });
})

http.listen(3000,() => {
  console.log("Server Started...");
});
/*
var groupsObj;
var groups = []; //Namespaces
var channels = []; // Rooms
var curGroup; //Current Namespace Name
var cg; //Current Namespace actual Socket

fs.readFile('channel&Groups.json', 'utf-8', function(err,data) {
  groupsObj = JSON.parse(data);
  for(i = 0; i < groupsObj.length; i++) {
    //console.log(groupsObj[i].group);
    groups.push(groupsObj[i].group);
  }
  curGroup = groups[0];
});

cg = io.of('curGroup');
cg.on('connection', function(socket){
  console.log("User Connected to Group: " + curGroup);

})
*/
