module.exports = function(app, io, fs, db) {
  console.log("Server Socket Initialized");
  var dbF = require('./dbFunctions.js')

  io.on('connection', (socket) => {
    console.log('user connection');
    socket.room = 'Welcome Channel';
    io.emit('message', {type:'message', text:"SERVER: A user has connected to the server."});

    socket.on('disconnect', function() {
      io.emit('message', {type:'message', text:"SERVER: A user has disconnected from the server."});
      console.log('user disconnected');
    });

    socket.on('join-room', function(newRoom, user) {
      // leave the current room (stored in session)
      socket.leave(socket.room);
      socket.in(socket.room).emit('message', {type:'message', text:"SERVER: " + user + " has left the room."});
      // join new room, received as function parameter
      socket.join(newRoom);
      socket.in(newRoom).emit('message', {type:'message', text:"SERVER: " + user + " has joined the room."});
      socket.emit('message', {type:'message', text:'SERVER: You have connected to '+ newRoom});
      // sent message to OLD room
      // update socket session room title
      socket.room = newRoom;
      console.log(socket.room);
    });

    socket.on('add-message', (message, username)=>{

      dbF.GetAvatar(db, username).then(result=> {
        io.sockets.in(socket.room).emit('message', {type:'message', text:message, avatar:result});
      })
    });

  });

}
