var include = require("includemvc");
var Connection = include.lib("connection");
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

	function getDatabase(database_name, serverId, callback) {
		Database.findOne({database_name: database_name, server: serverId})
		.populate("server")
		.exec(function(err, result) {
			if(err) throw err;
			if(result) {
				res.send(406, "The database exists in that server");
			}
			else {
				callback(null, true);
			}
		});
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
					database.save(function(err, databaseCreated) {
						if(err) {
							throw err;
						}

						if(databaseCreated) {
							if(body.createDatabase == "on") {
								// create the database
								if(serviceType == "mysql") {
									// attach the server object to the _server property in the databaseCreated
									databaseCreated._server = server;
									var mysql = new MySQL(databaseCreated);

									// get the right command
									var command = mysql.createDatabase();
								}

								if(serviceType == "mongodb") {
									// do nothing here
								}
								
								var connection = new Connection(result._id, server);
								connection.executeAsync(command, function(stderr, stdout) {
									console.log(stderr);
									console.log(stdout);
									res.send(200, {stdout: stdout, stderr: stderr});
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

exports.deleteDatabase = function(req, res) {
	var id = req.params.id;

	if(id) {
		Database.findOne({_id: id})
		.populate("server")
		.exec(function(err, database) {
			if(database) {
				database._server = database.server;

				var mysql = new MySQL(database);
				var command = mysql.dropDatabase();
				var connection = new Connection(id, database.server);
				console.log(command);
				connection.executeAsync(command, function(stderr, stdout) {
					Database.remove({_id: id}, function(err, result) {
						res.send(200, {stdout: stdout, stderr: stderr});
					})
				});
			}
		});
	}
	else {
		res.send(404);
	}
}

exports.postShowDatabases = function(req, res) {
	var serverId = req.body.server;

	if(serverId) {
		Server.findOne({_id: serverId}, function(err, server) {
			var database = {
				_server: server
			}
			var mysql = new MySQL(database);
			var command = mysql.showDatabases();
			var connection = new Connection(serverId, server);
			connection.executeAsync(command, function(stderr, stdout) {
				console.log(stderr);
				console.log(stdout);
				res.send(200, {stdout: stdout, stderr: stderr});
			});
		});
	}
	else {
		res.send(404);
	}
}

exports.postShowTables = function(req, res) {
	var databaseId = req.body.id;

	if(databaseId) {
		Database.findOne({_id: databaseId})
		.populate("server")
		.exec(function(err, database) {
			database._server = database.server;

			console.log(database);

			var mysql = new MySQL(database);
			var command = mysql.showTables();
			var connection = new Connection(databaseId, database._server);
			connection.executeAsync(command, function(stderr, stdout) {
				console.log(stderr);
				console.log(stdout);
				res.send(200, {stdout: stdout, stderr: stderr});
			});
		});
	}
	else {
		res.send(404);
	}
}