var include = require("includemvc");
var Secure = include.lib("secure");
var secure = new Secure();
var app = include.app();

function MySQL(options) {
	this.hostname = options.hostname;
	this.username = options.username || "root";
	this.password = secure.decrypt(options.password);
	this.port = options.port || "3306";
}

module.exports = exports = MySQL;

MySQL.prototype.showDatabases = function() {
	var command = '"SHOW DATABASES"';

	return 'mysql -u' + this.username + " -p" + this.password + " --port " + this.port + " -e" + command;
}

MySQL.prototype.createDatabase = function(database) {
	return 'mysqladmin -u' + this.username + " -p" + this.password + " --port " + this.port + " CREATE DATABASE " + database;
}

MySQL.prototype.createUser = function(database, user, password) {
	var pass = secure.decrypt(password);
	var command = '"FLUSH PRIVILEGES"';
	return 'mysql -u' + this.username + " -p" + this.password + " --port " + this.port + " -e" + command;
}

MySQL.prototype.assignPermissions = function(database, user, hostname) {
	var command = '"FLUSH PRIVILEGES"';
	return 'mysql -u' + this.username + " -p" + this.password + " --port " + this.port + " -e" + command;
}

MySQL.prototype.flushPrivileges = function(database) {
	var command = '"FLUSH PRIVILEGES"';
	return 'mysql -u' + this.username + " -p" + this.password + " --port " + this.port + " -e" + command;
}

MySQL.prototype.dumpDatabase = function(database, filename) {
	return 'mysqldump -u' + this.username + " -p" + this.password + " --opt --port " + this.port + " " + database + " > " + filename; 
}