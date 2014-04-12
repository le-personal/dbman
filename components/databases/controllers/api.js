var include = require("includemvc");
var SSH = include.lib("ssh");
var MySQL = include.lib("mysql", "databases");
var Server = include.model("servers");
var app = include.app();
var util = require("util");
var models = include.model("databases");
var Database = models.Database;
var Connection = include.lib("connection");

exports.getDatabases = function(req, res) {
	Database.find()
	.populate("server")
	.exec(function(err, results) {
		if(err) throw err;
		if(results) {
			res.send(200, results);
		}
	});
}

exports.getDatabase = function(req, res) {
	var id = req.params.id;
	Database.findOne({_id: id})
	.populate("server")
	.populate("author")
	.populate("permissions.edit")
	.populate("permissions.export")
	.populate("permissions.import")
	.populate("permissions.restore")
	.populate("permissions.backup")
	.populate("permissions.remove")
	.exec(function(err, result) {
		if(err) {
			res.send(404);
		}
		if(result) {
			res.send(200, {server: result.server, database: result});
		}
		else {
			res.send(404);
		}
	});
}


exports.postDatabase = function(req, res) {
	var body = req.body;
	var user = req.user;
	var serverId = body.server;

	console.log(body);

	function getDatabase(database_name, serverId, callback) {
		Database.findOne({database_name: database_name, server: serverId}, function(err, result) {
			if(err) throw err;
			if(result) {
				res.send(406, "The database exists in that server");
			}
			else {
				callback(null, true);
			}
		})
	}

	Server.findOne({_id: serverId}, function(err, server) {
		if(err) throw err;
		if(server) {

			getDatabase(body.database_name, serverId, function(err, result) {
				if(result) {
					var serviceType = server.service.type;

					var db = {
						database_name: body.database_name,
						database_type: serviceType,
						server: serverId,
						author: user,
						permissions: {
							edit: [user],
							export: [user],
							import: [user],
							restore: [user],
							backup: [user],
							remove: [user]
						},
						isLocked: false,
					}

					var database = new Database(db);
					database.save(function(err, result) {
						if(err) {
							throw err;
						}

						if(result) {
							if(body.createDatabase == "on") {
								// create the database

								var connection = new SSH({
									host: server.ip,
									username: server.ssh_username,
									privateKey: server.ssh_keyPath,
									port: server.ssh_port
								});

								if(serviceType == "mysql") {
									var mysql = new MySQL({
										hostname: server.ip,
										username: server.service.username,
										password: server.service.password,
										port: server.service.port
									});

									// get the right command
									var command = mysql.createDatabase(body.database_name);
								}

								if(serviceType == "mongodb") {
									// do nothing here
								}

								// execute the command
								connection.execute(result._id, command);

								app.on("ssh:execute:end:" + result._id, function() {
									res.send(201, result);
								});
							}
							else {
								res.send(201, result);
							}
						}
						else {
							res.send(406);
						}
					});			
				}
			});
		}
	});	
}