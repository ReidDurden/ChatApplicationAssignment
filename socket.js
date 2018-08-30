module.exports = function(app, io) {
  console.log("Server Socket Initialized");

  io.on('connection', (socket) => {
    console.log('user connection');

    socket.on('disconnect', function() {
      console.log('user disconnected');
    });

    socket.on('add-message', (message) => {
      io.emit('message',{type:'message',text:message});
    })
  });

  var groups = ''; //Namespaces
  var channels = ''; // Rooms

  

}
