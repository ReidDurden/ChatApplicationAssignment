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

/*    socket.on('new-room', function(newRoom, curGroup) {
      console.log("Entered new room");
      fs.readFile('channel&Groups.json', 'utf-8', function(err,data){

        var groupsInfo;
        if(err) {

          console.log(err);

        } else {
          groupsInfo = JSON.parse(data);
          for(let i = 0;i < groupsInfo.length;i++){
            if(groupsInfo[i].gName == curGroup) {
              groupsInfo[i].channels.push(newRoom);
              console.log("pushed new channel " +newRoom);
              console.log(groupsInfo[i].channels);
              return;
            }
          }
          var newData = JSON.stringify(groupsInfo);
          console.log("New Data " + newData);
          fs.writeFile('channel&Groups.json', newData, 'utf-8', function(err) {

            if (err) {
              console.log(err);
            }
            console.log("A new room was created in the group " + newRoom);
            //socket.emit('message', {type:'message', text:'SERVER: A new channel has been created: '+ newRoom});
            console.log("The emit was send");
          });
         }

      });
    });
    */


  });

}
