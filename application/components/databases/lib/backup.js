var events = require("events");
var util = require("util");
var include = require("includemvc");
var model = include.model("databases");
var DatabaseModel = model.Database;
var BackupModel = model.Backup;
var path = require("path");
var MySQL = include.lib("mysql", "databases");
var Connection = include.lib("connection");

function Backup(options) {
	var self = this;

	this.options = options || {};
	this.name = "";
	this.filename = "";
	this.remoteFilename = "";
	this.filepath = "";
	this.server = {};
	this.database = {};
	this.backup = {};
	this.format = "";
	this.strategy = "";
	this.failed = false;

	events.EventEmitter.call(this);

	this.on("createBackupOnServer:error", function(error) {
		console.log("The process to create the backup on the server has failed, the error thrown is:");
		console.log(error);
		var err = {
			error: error,
			status: "failed",
			step: "createBackupOnServer"
		}
		return self.emit("backup:error", err);
	});

	this.on("createBackupOnServer:done", function(result) {
		console.log("Created backup on server, starting download");
		console.log(result);
		// if there's a result, execute the method
		self.downloadFileFromServer();
	});

	this.on("downloadFileFromServer:error", function(error) {
		console.log("The process to download the backup from the server has failed, the error thrown is:");
		console.log(error);
		var err = {
			error: error,
			status: "failed",
			step: "downloadFileFromServer"
		}
		return self.emit("backup:error", err);
	});

	this.on("downloadFileFromServer:done", function(result) {
		console.log("Downloaded file from server");
		console.log(result);
		console.log(self.backup);
		return self.emit("backup:done", self.backup);
	});
}

util.inherits(Backup, events.EventEmitter);

/**
 * Init the backup process
 * @return {void}
 */
Backup.prototype.init = function(callback) {
	var self = this;

	self.getDatabase(function(err, result) {
		if(result) {
			self.saveBackup(function(err, backup) {
				if(err) self.failed = true;
				if(backup) {
					// trigger the event createBackupOnServer but
					// return the backup to finish the init method
					// and return the result of the backup
					self.createBackupOnServer();
				}
				
				return callback(err, backup);
			});
		}
	});
}

/**
 * Get a database
 * @param  {Function} callback A function callback to return when done
 * @return {Function}            Returns the function callback set in the argument callback
 *                                       with err and result as arguments.
 */
Backup.prototype.getDatabase = function(callback) {
	var self = this;
	var databaseid = self.options.databaseid;

	DatabaseModel.findOne({_id: databaseid})
	.populate("server")
	.exec(function(err, result) {
		if(err) console.log(err);
		if(result) {
			console.log("Result from getDatabase");
			self.server = result.server;
			self.database = result;
		}

		return callback(err, result);
	});
}

/**
 * Set the property filename
 * @return {void}
 */
Backup.prototype.setNames = function() {
	var backupsDirectory = this.options.backupsDirectory;
	var name = this.options.name + "-" + Date.now();
	var filename = name + "." + this.options.format;
	var filepath = path.join(backupsDirectory, filename);
	var url = "/backups/" + filename;

	this.name = name;
	this.filename = filename;
	this.filepath = filepath;
	this.url = url;
	this.format = this.options.format;

	return;
}

/**
 * Save a backup to the database
 * @param  {Function} callback A callback to execute when finished
 * @return {Function}            Function set in callback
 */
Backup.prototype.saveBackup = function(callback) {
	var self = this;

	// this will set the values of several class properties
	self.setNames();

	var data = {
		name: this.filename,
		author: this.options.author,
		fileName: this.filename,
		filePath: this.filepath,
		url: this.url,
		database: this.database._id,
		type: this.database.type,
		format: this.format,
		status: "processing",
		expires: new Date(Date.now() + 6.048e+8),
	}

	var model = new BackupModel(data);
	model.save(function(err, result) {
		if(err) console.log(err);
		if(result) {
			self.backup = result;
			console.log(result);
		}
		
		return callback(err, result);
	});
}

/**
 * Updates the status of a backup
 * @param  {string}   status   The string to set as a status, can be created, failed, finished, processing
 * @param  {Function} callback The callback to execute
 * @return {Function}            The callback executed
 */
Backup.prototype.updateStatus = function(id, status, callback) {
	var changes = {
		status: status
	};

	BackupModel.findByIdAndUpdate(id, {$set: changes}, function(err, result) {
		return callback(err, result);
	});	
}

/**
 * Creates the backup on the server
 * @return {[type]} [description]
 */
Backup.prototype.createBackupOnServer = function() {
	var self = this;

	console.log("Using server");
	console.log(self.server);

	var connection = new Connection(self.backup._id, self.server);
	var remoteFilename = path.join("/tmp", self.filename);
	self.remoteFilename = remoteFilename;

	var database = self.database;
	database._server = self.server;

	var mysql = new MySQL(database);
	var command = mysql.dumpDatabase(remoteFilename, self.format);
	
	connection.executeAsync(command, function(stderr, stdout) {
		var status = stderr ? "error" : "created";
		self.updateStatus(self.backup._id, status, function(err, response) {
			if(stderr) {
				self.failed = true;
				return self.emit("createBackupOnServer:error", stderr);
			}
			else {
				self.failed = false;
				return self.emit("createBackupOnServer:done", stdout);
			}
		});
	});
}

Backup.prototype.downloadFileFromServer = function() {
	var self = this;
	var backupsDirectory = this.options.backupsDirectory;
	var remoteFilename = this.remoteFilename;
	var localFilename = path.join(backupsDirectory, self.filename);

	var connection = new Connection(self.backup._id, self.server);
	connection.downloadAsync(remoteFilename, localFilename, function(stderr, stdout) {
		var status = stderr ? "error" : "finished";

		self.updateStatus(self.backup._id, status, function(err, result) {
			if(stderr) {
				self.failed = true;
				return self.emit("downloadFileFromServer:error", stderr);
			}
			else {
				self.failed = false;
				return self.emit("downloadFileFromServer:done", stdout);
			}
		});
	});
}

module.exports = exports = Backup;