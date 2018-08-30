module.exports = function(app, io, fs) {
  console.log("Server Socket Initialized");
  
  io.on('connection', (socket) => {
    console.log('user connection');
    socket.room = 'default';

    socket.on('disconnect', function() {
      console.log('user disconnected');
    });

    socket.on('join-room', function(newRoom) {
      // leave the current room (stored in session)
      socket.leave(socket.room);
      // join new room, received as function parameter
      socket.join(newRoom);
      socket.emit('message', {type:'message', text:'SERVER: You have connected to '+ newRoom});
      // sent message to OLD room
      socket.broadcast.to(socket.room).emit('message', 'SERVER: A user has left this room.');
      // update socket session room title
      socket.room = newRoom;
      console.log(socket.room);
      socket.broadcast.to(newRoom).emit('message', 'SERVER: A user has joined this room.');
    });

    socket.on('add-message', (message)=>{
      io.sockets.in(socket.room).emit('message', {type:'message', text:message});
    });

    //socket.on('add-message', (message) => {
    //  io.emit('message',{type:'message',text:message});
    //})
  });

}
