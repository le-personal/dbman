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
   
    app.on("ssh:testConnection:data", function(data) {
      socket.emit("ssh:testConnection:data", data);
    });

    app.on("ssh:testConnection:end", function() {
      socket.emit("ssh:testConnection:end");
    })
   
    app.on("ssh:execute:data", function(data) {
      socket.emit("ssh:execute:data", data);
    })

    app.on("test", function(data) {
    	console.log("Firing up event test");
    	socket.emit("test", data);
    });
  })
}