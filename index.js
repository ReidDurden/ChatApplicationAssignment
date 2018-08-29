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

require('./socket.js')(app, io);
require('./auth.js')(app,fs);
require('./register.js')(app,fs);

/*
app.get('/test', function(req,res){
  console.log('You entered the test route on express');
});

app.get('/login', function(req,res) {
  res.sendFile(__dirname + '/dist/ChatApplicaton/index.html');
});

app.get('/chat', function(req,res) {
  res.sendFile(__dirname + '/dist/ChatApplicaton/index.html');
});

*/

app.get('/*', function(req,res) {
  res.sendFile(__dirname + '/dist/ChatApplicaton/index.html')
});

http.listen(3000,() => {
  console.log("Server Started...");
});
