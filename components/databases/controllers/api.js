var include = require("includemvc");
var Connection = include.lib("connection");
var MySQL = include.lib("mysql", "databases");
var Server = include.model("servers");
var app = include.app();
var util = require("util");
var models = include.model("databases");
var Database = models.Database;
var DatabaseUser = models.DatabaseUser;
var Connection = include.lib("connection");
var Secure = include.lib("secure");
var secure = new Secure();
var File = include.model("files");

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
			DatabaseUser.find({database: result._id})
			.exec(function(err, users) {
				res.send(200, {server: result.server, database: result, users: users});
			});
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
						DatabaseUser.find({database: id}, function(err, users) {
							if(users) {
								var counter = 0;
								var total = users.length;
								users.forEach(function(user) {
									DatabaseUser.remove({_id: user._id}, function(err, result) {
										counter++;

										if(counter == total) {
											res.send(200, {stdout: stdout, stderr: stderr});
										}
									})
								});
							}
						})
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

exports.postShowUsersInDatabase = function(req, res) {
	var databaseId = req.body.id;

	if(databaseId) {
		Database.findOne({_id: databaseId})
		.populate("server")
		.exec(function(err, database) {
			database._server = database.server;

			var mysql = new MySQL(database);
			var command = mysql.showUsersInDatabase();
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

exports.postLockDatabase = function(req, res) {
	var id = req.body.id;
	Database.update({_id: id}, {isLocked: true}, function(err, result) {
		if(err) {
			res.send(406);
		}
		if(result) {
			res.send(200, true);
		}
	});
}

exports.postUnLockDatabase = function(req, res) {
	var id = req.body.id;
	Database.update({_id: id}, {isLocked: false}, function(err, result) {
		if(err) {
			res.send(406);
		}
		if(result) {
			res.send(200, true);
		}
	});	
}


/**
 Users
*/
exports.getDatabaseUsers = function(req, res) {
	DatabaseUser.find().exec(function(err, users) {
		if(err) {
			res.send(406);
		}
		if(users) {
			res.send(200, users);
		}
	});
}

exports.getDatabaseUser = function(req, res) {
	var id = req.params.id;
	if(id) {
		DatabaseUser.findOne({_id: id})
		.populate("database")
		.exec(function(err, user) {
			if(err) {
				res.send(406);
			}
			if(user) {
				res.send(200, user);
			}
		});
	}
	else {
		res.send(404);
	}
}

exports.postDatabaseUser = function(req, res) {
	var body = req.body;

	function getDatabase(id, callback) {
		Database.findOne({_id: id})
		.populate("server")
		.exec(function(err, result) {
			callback(err, result);
		});
	}

	function saveUser(body, callback) {
		var values = {
			username: body.username,
			password: secure.encrypt(body.password),
			database: body.database,
			allowedHosts: body.allowedHosts
		}

		var model = new DatabaseUser(values);
		model.save(function(err, result) {
			if(err) {
				res.send(406, err);
			}
			if(result) {
				callback(null, result);
			}
		})
	};

	function createUser(user, database, callback) {
		console.log("Creating user");
		var server = database.server;
		database._server = server;
		
		var connection = new Connection(user._id, server);
		var mysql = new MySQL(database);

		var hosts = user.allowedHosts;

		// add localhost always
		hosts.push("localhost");
		var counter = 0;
		var total = hosts.length;
		hosts.forEach(function(host) {
			// commands
			var createUserCommand = mysql.createUser(user.username, user.password, host);

			console.log("Executing user command");
			connection.executeAsync(createUserCommand, function(stderr, stdout) {
				counter++;

				if(counter == total) {
					callback();
				}
			});
		});
	}

	function assignPermissions(user, database, callback) {
		var server = database.server;
		database._server = server;
		
		var connection = new Connection(user._id, server);
		var mysql = new MySQL(database);

		var hosts = user.allowedHosts;
		hosts.push("localhost");
		var counter = 0;
		var total = hosts.length;
		hosts.forEach(function(host) {
			// define command
			var assignPermissionsCommand = mysql.assignPermissions(user.username, host);
			connection.executeAsync(assignPermissionsCommand, function(stderr, stdout) {
				counter++;

				if(counter == total) {
					callback();
				}
			});
			
		});
	}

	function flush(user, database, callback) {
		var server = database.server;
		database._server = server;
		
		var connection = new Connection(user._id, server);
		var mysql = new MySQL(database);
		var flushCommand = mysql.flushPrivileges();
		connection.executeAsync(flushCommand, function(stderr, stdout) {
			callback();
		});
	}

	if(body.username && body.password && body.allowedHosts && body.database) {
		getDatabase(body.database, function(err, database) {
			if(err) res.send(406, "Invalid database");
			if(database) {
				saveUser(body, function(err, newUser) {
					if(err) res.send(406, err);
					if(newUser) {
						res.send(201, newUser);
						createUser(newUser, database, function() {
							assignPermissions(newUser, database, function() {
								flush(newUser, database, function() {
									console.log("Finished running all commands");
								});
							});
						});

					}
				})
			}
		})
	}
	else {
		res.send(406, "All fields are required");
	}
}


exports.deleteDatabaseUser = function(req, res) {
	var id = req.params.id;

	function dropUser(user, database, host, callback) {
		database._server = database.server;
		var connection = new Connection(id, database.server);
		var mysql = new MySQL(database);

		var command = mysql.dropUser(user.username, host);
		connection.executeAsync(command, function(stderr, stdout) {
			callback(stderr, stdout);
		});
	}
	
	if(id) {
		DatabaseUser.findOne({_id: id})
		.exec(function(err, user) {
			if(user) {
				Database.findOne({_id: user.database})
				.populate("server")
				.exec(function(err, database) {				
					user.allowedHosts.push("localhost");
					var count = 0;
					var total = user.allowedHosts.lenght;

					user.allowedHosts.forEach(function(host) {
						dropUser(user, database, host, function(stderr, stdout) {
							if(!stderr) {
								DatabaseUser.remove({_id: id}, function(err, result) {
									res.send(200, {stdout: stdout, stderr: stderr});
								})
							}
							if(stderr) {
								res.send(406, stderr);
							}
							else {
								res.send(406, "There was a problem droping the user");
							}
						})						
					});
				});
			}
		});
	}
	else {
		res.send(404);
	}
}

exports.postCreateBackup = function(req, res) {
	var body = req.body;
	var files = req.files;
	console.log(files);
	console.log(body);
}

exports.postImportDatabase = function(req, res) {
	var body = req.body;

	function getDatabase(id, callback) {
		Database.findOne({_id: id})
		.populate("server")
		.exec(function(err, result) {
			return callback(err, result);
		});
	}

	function getFile(id, callback) {
		File.findOne({_id: id})
		.exec(function(err, result) {
			return callback(err, result);
		})
	}

	function uploadFileToServer(id, server, file, callback) {
		var connection = new Connection(id, server);
		connection.uploadAsync(file, function(err, result) {
			return callback(err, result);
		});
	}

	function runImportProcess(id, database, file) {
		database._server = database.server;
		var connection = new Connection(id, database.server);
		
		var mysql = new MySQL(database);
		var command = mysql.importDatabase(file);

		console.log("Executing runImportProcess");
		console.log(command);
		connection.execute(command);
	}

	if(body.id && body.file) {
		getDatabase(body.id, function(err, database) {
			var server = database.server;
			if(err) res.send(500, err);
			if(database) {
				getFile(body.file, function(err, file) {
					if(err) res.send(500, err);
					if(file) {
						uploadFileToServer(file._id, server, file, function(err, result) {
							if(err) res.send(500, err);
							if(result) {
								res.send(200, result);

								runImportProcess(file._id, database, file);
							}
						});
					}
				});
			}
		})
	}
	else {
		res.send(406, "A file and a database is needed");
	}
}

