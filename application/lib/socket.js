var include = require("includemvc");
var io = require("socket.io");
var app = include.app();

module.exports = function(server) {
  var sio = io.listen(server, {log: true});

  sio.sockets.on("connection", function(socket) {
    /**
     * Define events here
     
    app.on("group:event", function(data) {
        socket.emit("group:event", data);
    })
    
    */

    app.on("servers:added", function(data) {
      console.log("Listened to servers:added");
      socket.emit("servers:added", data);
    });

    app.on("servers:removed", function(data) {
      console.log("Listened to servers:removed");
      socket.emit("servers:removed", data);
    })
   
    app.on("ssh:testConnection:data", function(data) {
      socket.emit("ssh:testConnection:data", data);
    });

    app.on("ssh:testConnection:end", function() {
      socket.emit("ssh:testConnection:end");
    })
   
    app.on("ssh:execute:data", function(data) {
      // emit a general event
      socket.emit("ssh:execute:data", data);

      // and a unique event
      socket.emit("ssh:execute:data:" + data.id, data);
    })

    app.on("test", function(data) {
    	console.log("Firing up event test");
    	socket.emit("test", data);
    });

    app.on("file:uploading", function(data) {
      socket.emit("file:uploading", data);
    })

    app.on("file:finished", function(data) {
      socket.emit("file:finished", data);
    })

    app.on("backup:error", function(error) {
      socket.emit("backup:error", error);
    });

    app.on("backup:done", function(backup) {
      socket.emit("backup:done", backup);
    });
  })
}