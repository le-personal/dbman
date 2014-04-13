var include = require("includemvc");
var Secure = include.lib("secure");
var secure = new Secure();
var app = include.app();

function MySQL(options) {
	this.hostname = options._server.ip;
	this.username = options._server.service.username || "root";
	this.password = secure.decrypt(options._server.service.password);
	this.port = options._server.service.port || "3306";
	this.database_name = options.database_name || null;
}

module.exports = exports = MySQL;

MySQL.prototype.showDatabases = function() {
	var command = '"SHOW DATABASES"';

	return 'mysql -u' + this.username + " -p" + this.password + " --port " + this.port + " -e" + command;
}

MySQL.prototype.showTables = function() {
	var database = this.database_name;
	var command = '"SHOW TABLES FROM '+ database +'"';

	return 'mysql -u' + this.username + " -p" + this.password + " --port " + this.port + " -e" + command;
}

MySQL.prototype.createDatabase = function() {
	var database = this.database_name;
	return 'mysqladmin -u' + this.username + " -p" + this.password + " --port " + this.port + " CREATE " + database;
}

MySQL.prototype.dropDatabase = function() {
	var database = this.database_name;
	return 'yes | mysqladmin -u' + this.username + " -p" + this.password + " --port " + this.port + " DROP " + database;
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