var include = require("includemvc");
var Secure = include.lib("secure");
var secure = new Secure();
var path = require("path");
var app = include.app();

function MySQL(options) {
	this.hostname = options._server.ip;
	this.username = options._server.service.username || "root";
	this.password = secure.decrypt(options._server.service.password);
	this.port = options._server.service.port || "3306";
	this.database_name = options.database_name || null;
	this.database_encoding = options.database_encoding || "utf8";
	this.database_collate = options.database_collate || "utf8_unicode_ci";
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
	var encoding = this.database_encoding;
	var collate = this.database_collate;
	return 'echo "CREATE DATABASE ' + database + ' DEFAULT CHARACTER SET '+ encoding +' COLLATE '+ collate +';" | mysql -u' + this.username + " -p" + this.password + " --port " + this.port;
}

MySQL.prototype.dropDatabase = function() {
	var database = this.database_name;
	return 'yes | mysqladmin -u' + this.username + " -p" + this.password + " --port " + this.port + " DROP " + database;
}

MySQL.prototype.dropUser = function(user, host) {
	var query = 'DROP USER \'' + user + '\'@\'' + host + '\'';
	var command = 'mysql' +
	' -u' + this.username +
	' -p' + this.password +
	' --port ' + this.port +
	' -e "' + query + '"';

	return command;
}

MySQL.prototype.createUser = function(user, password, hostname) {
	var database = this.database_name;	

	var query = 'CREATE USER \'' + user + '\'@' + '\'' + hostname + '\' IDENTIFIED BY \''+ password +'\'';
	var command = 'mysql' +
	' -u' + this.username +
	' -p' + this.password +
	' --port ' + this.port +
	' -e "' + query + '"';

	return command;
}

MySQL.prototype.assignPermissions = function(user, hostname) {
	var database = this.database_name;
	
	var query = 'GRANT ALL ON ' + database + '.* TO \'' + user + '\'@' + '\'' + hostname +  '\'';
	var command = 'mysql' +
	' -u' + this.username +
	' -p' + this.password +
	' --port ' + this.port +
	' -e "' + query + '"';

	return command;
}

MySQL.prototype.flushPrivileges = function() {
	var command = '"FLUSH PRIVILEGES"';
	return 'mysql -u' + this.username + " -p" + this.password + " --port " + this.port + " -e" + command;
}

MySQL.prototype.showUsersInDatabase = function() {
	var database = this.database_name;
	
	var query = 'SELECT host as HOST_ALLOWED, db as DB, user as USER FROM mysql.db WHERE db = \'' + database + '\'';
	var command = 'mysql' +
	' -u' + this.username +
	' -p' + this.password +
	' --port ' + this.port +
	' -e "' + query + '"';

	return command;
}

MySQL.prototype.dumpDatabase = function(filename, format) {
	console.log("Creating database with format %s", format);
	var database = this.database_name;
	if(format == "sql") {
		var command = 'mysqldump -u' + this.username + " -p" + this.password + " --opt --port " + this.port + " " + database + " > " + filename; 
	}

	if(format == "sql.gz") {
		var command = 'mysqldump -u' + this.username + " -p" + this.password + " --opt --port " + this.port + " " + database + " | gzip -9 > " + filename;
	}

	return command;
}

MySQL.prototype.importDatabase = function(file) {
	var database = this.database_name;
	var filePath = path.join("/tmp", file._id + file.extension);

	var command = 'mysql' +
		' -u' +this.username +
		' -p' + this.password +
		' --port ' + this.port +
		' ' + database +
		' < ' + filePath;

	return command;
}