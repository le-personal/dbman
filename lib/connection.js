var include = require("includemvc");
var SSH = include.lib("ssh");
var app = include.app();
var util = require("util");
var events = require("events");

function Connection(id, server) {
	events.EventEmitter.call(this);

	this.id = id;
	this.server = server;
	this.ssh = new SSH({
		host: this.server.ip,
		port: this.server.ssh_port,
		username: this.server.ssh_username,
		privateKey: this.server.ssh_keyPath
	});

}

util.inherits(Connection, events.EventEmitter);
module.exports = Connection;

Connection.prototype.execute = function(command) {
	console.log("connection execute");
	this.emit("start");
	this.ssh.execute(this.id, command);
}