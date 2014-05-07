define(function(require) {
	var io = require("/socket.io/socket.io.js");
	var socket = io.connect();

	return socket;
});