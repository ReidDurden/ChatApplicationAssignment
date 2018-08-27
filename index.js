const express = require('express');
const app = express();
const path = require('path');
const http = require('http').Server(app);
const io = require('socket.io')(http);

app.use(express.static(path.join('dist/ChatApplicaton')));

require('./socket.js')(app, io);
http.listen(3000,() => {
  console.log("Server Started...");
});
