var events = require("events");
var include = require("includemvc");
var Model = include.model("databases");

function Backup() {
	this.filename = "";
	this.filepath = "";
	this.server = {};
	this.database = {};
	this.format = "";
	this.strategy = "";

	events.EventEmitter.call(this);
}

Backup.prototype.createFilename = function() {
	var database  this.database;
	var now = new Date(Date.now());
	this.file = database.name + now;

	return this.filename;
}

Backup.prototype.getDatabase = function(id, callback) {
	Model.findOne({_id: id})
	.populate("server")
	.exec(function(err, result) {
		if(result) {
			this.server = result.server;
			this.database = result.database;
		}

		callback(err, result);
	});
}

Backup.prototype.createFileDump = function() {
	// order ssh to run mysqldump -uroot -p{password} --opt this.filename < databasename
	// trigger event on done

	this.emit("backup:createFileDump:done");
}

Backup.prototype.transferFile = function() {
	// order ssh to transfer the file created and place it under some directory

	this.emit("backup:transferFile:done");
}

Backup.prototype.createURL = function() {
	var url = this.filepath + "/" + this.filename;
	return url;
}

Backup.prototype.save = function(callback) {
	var user = req.user;

	var data = {
		name: this.createFilename(),
		author: user,
		fileName: this.filename,
		filePath: this.filepath,
		database: this.database._id,
		type: this.database.type,
		format: this.format,
		strategy: this.strategy,
		status: "in progress",
		expires: new Date(Date.now()) + 3600000000
	}

	var model = new Model(data);
	model.save(function(err, result){
		if(err) {
			callback(err, null);
		}
		if(result) callback(err, result);
	});
}

Backup.prototype.updateStatus = function(status, callback) {
	var id = this.database._id;

	Model.update({_id: id}, {status: status}, function(err, result) {
		callback(err, result);
	});	
}

Backup.prototype.create = function(database, callback) {
	
}