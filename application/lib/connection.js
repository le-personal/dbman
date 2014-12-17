var include = require("includemvc");
var SSH = include.lib("ssh");
var app = include.app();
var util = require("util");
var events = require("events");
var path = require("path");

function Connection(id, server) {
	events.EventEmitter.call(this);

	this.id = id;
	this.server = server;
	
	this.ssh = new SSH({
		host: this.server.ip,
		port: this.server.ssh_port,
		username: this.server.ssh_username,
		privateKey: this.server.ssh_keypath
	});
}

util.inherits(Connection, events.EventEmitter);
module.exports = Connection;

Connection.prototype.execute = function(command) {
	this.ssh.execute(this.id, command);
}

Connection.prototype.executeAsync = function(command, callback) {
	this.ssh.executeAsync(this.id, command, function(stderr, stdout) {
		callback(stderr, stdout);
	});
}

Connection.prototype.uploadAsync = function(file, callback) {
	var localFilepath = file.filepath;

	// use the id of the file to create the new name
	var remoteFilepath = path.join("/tmp", file._id + file.extension);

	this.ssh.uploadAsync(localFilepath, remoteFilepath, function(err, result) {
		callback(err, result);
	});
}

/** 
 * @param local string
 * @param remote string 
 */
Connection.prototype.downloadAsync = function(remote, local, callback) {
	this.ssh.downloadAsync(remote, local, function(err, result) {
		callback(err, result);
	});
}