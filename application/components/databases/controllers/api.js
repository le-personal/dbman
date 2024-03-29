var include = require("includemvc");
var Connection = include.lib("connection");
var MySQL = include.lib("mysql", "databases");
var Server = include.model("servers");
var app = include.app();
var util = require("util");
var models = include.model("databases");
var Database = models.Database;
var Backup = models.Backup;
var DatabaseUser = models.DatabaseUser;
var Secure = include.lib("secure");
var secure = new Secure();
var File = include.model("files");
var config = app.config;
var path = require("path");
var BackupLib = include.lib("backup", "databases");

exports.getDatabases = function(req, res) {
	Database.find()
	.populate("server")
	.populate("author")
	.populate("permissions.view")
	.populate("permissions.edit")
	.populate("permissions.import")
	.populate("permissions.remove")
	.exec(function(err, databases) {
		if(err) res.send(404);
		if(databases) {
			var results = [];
			var total = databases.length;
			var count = 0;

			if(total > 0) {
				databases.forEach(function(database) {
					DatabaseUser.find({database: database._id})
					.exec(function(err, users) {
						Backup.find({database: database._id})
						.populate("author")
						.exec(function(err, backups) {

							// result is what we send to the array
							// before adding the users and backups results
							// we need to convert the database result to an object
							var result = database.toObject();
							result.users = users;
							result.backups = backups;

							// push to the array of results
							results.push(result);

							count++;
							if(total == count) {
								res.send(200, results);
							}
						});
					});
				});
			}
			else {
				res.send(200, []);
			}
		}
	});
}

exports.getDatabase = function(req, res) {
	var id = req.params.id;
	Database.findOne({_id: id})
	.populate("server")
	.populate("author")
	.populate("permissions.view")
	.populate("permissions.edit")
	.populate("permissions.import")
	.populate("permissions.remove")
	.exec(function(err, result) {
		if(err) {
			res.send(404);
		}
		if(result) {
			DatabaseUser.find({"database": result._id})
			.exec(function(err, users) {

				Backup.find({"database": result._id})
				.populate("author")
				.exec(function(err, backups) {

					// not working, had to rewrite
					// var database = result;
					// database["users"] = users;
					// database["backups"] = backups;

					var response = {
						backups: backups,
						users: users,
						server: result.server,
						author: result.author,
						permissions: result.permissions,
						_id: result._id,
						database_name: result.database_name,
						database_type: result.database_type,
						isLocked: result.isLocked,
						created: result.created,
						_v: result._v
					}

					res.send(200, response);
				})
			});
		}
		else {
			res.send(404);
		}
	});
}

exports.putDatabase = function(req, res) {
	var body = req.body;
	var id = req.params.id;

	var description = body.description;

	Database.update({_id: id}, {description: description}, function(err, updated) {
		console.log("Finishsed updating");
		if(err) {
			res.send(406, err);
		}
		
		res.send(201, updated);
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
			if(err) res.send(406, err);
			if(result) {
				res.send(406, "The database exists in that server");
			}
			else {
				callback(null, true);
			}
		});
	}

	Server.findOne({_id: serverId}, function(err, server) {
		if(err) res.send(406, err);
		if(server) {
			getDatabase(body.database_name, serverId, function(err, result) {
				if(result) {
					var serviceType = server.service.type;

					// set db encoding
					var database_encoding = body.database_encoding ? body.database_encoding : "utf8";
					var database_collate = body.database_collate ? body.database_collate : "utf8_general_ci";

					var db = {
						database_name: body.database_name,
						database_type: serviceType,
						database_encoding: database_encoding,
						database_collate: database_collate,
						description: body.description,
						server: serverId,
						author: user,
						permissions: {
							view: [user],
							edit: [user],
							import: [user],
							remove: [user]
						},
						isLocked: false,
					}

					var database = new Database(db);
					database.save(function(err, databaseCreated) {
						if(err) {
							res.send(500, err);
						}

						if(databaseCreated) {

							Database.findOne(databaseCreated)
							.populate("server")
							.populate("author")
							.exec(function(err, newDatabase) {
								if(newDatabase) {

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
											// var send = {
											// 	_id: databaseCreated._id,
											// 	_v: databaseCreated._v,
											// 	database_name: databaseCreated.database_name,
											// 	database_type: databaseCreated.database_type,
											// 	author: databaseCreated.author,
											// 	permissions: databaseCreated.permissions,
											// 	isLocked: databaseCreated.isLocked,
											// 	created: databaseCreated.created
											// }
											// send.server = server;
											// send.stdout = stdout;
											// send.stderr = stderr;

											res.send(201, newDatabase);
										});
									}
									else {
										res.send(201, newDatabase);
									}

								}
							});
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
											res.send(200, database);
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
	console.log(serverId);
	if(serverId) {
		Server.findOne({_id: serverId}, function(err, server) {
			if(err) {
				res.send(500, err);
			}
			if(server) {
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
			}
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
	var databaseid = req.params.id;
	DatabaseUser.find({database: databaseid})
	.exec(function(err, users) {
		if(err) {
			res.send(406);
		}
		if(users) {
			res.send(200, users);
		}
	});
}

exports.getDatabaseUser = function(req, res) {
	var databaseid = req.params.id;
	var userid = req.params.userid;

	if(databaseid && userid) {
		DatabaseUser.findOne({database: databaseid, _id: id})
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
	var databaseid = req.params.id;
	var body = req.body;

	// translate body.sync
	var sync = body.sync == "on" ? true : false;

	var valuesToSave = {
		username: body.username,
		password: secure.encrypt(body.password),
		database: databaseid,
		allowedHosts: body.allowedHosts
	}

	function getDatabase(id, callback) {
		Database.findOne({_id: databaseid})
		.populate("server")
		.exec(function(err, result) {
			callback(err, result);
		});
	}

	function saveUser(body, callback) {
		console.log(body);

		var values = {
			username: body.username,
			password: secure.encrypt(body.password),
			database: databaseid,
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

	if(body.username && body.password && body.allowedHosts && req.params.id) {
		getDatabase(databaseid, function(err, database) {
			if(err) res.send(406, "Invalid database");
			if(database) {
				saveUser(valuesToSave, function(err, newUser) {
					if(err) res.send(406, err);
					if(newUser) {
						res.send(201, newUser);


						// if there's no order to NOT create the user, then create it
						if(!sync) {
							// we need to send the password unencrypted to the createUser function
							// because we can't unencrypt later for some reason (I'm not a crypto expert I guess)
							newUser.password = body.password;

							createUser(newUser, database, function() {
								assignPermissions(newUser, database, function() {
									flush(newUser, database, function() {
										console.log("Finished running all commands");
									});
								});
							});
						}
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
	var databaseid = req.params.id;
	var userid = req.params.userid;

	function dropUser(user, database, host, callback) {
		database._server = database.server;
		var connection = new Connection(userid, database.server);
		var mysql = new MySQL(database);

		var command = mysql.dropUser(user.username, host);
		connection.executeAsync(command, function(stderr, stdout) {
			callback(stderr, stdout);
		});
	}

	if(userid && databaseid) {
		DatabaseUser.findOne({database: databaseid, _id: userid})
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
							if(stderr) {
								// if it fails, Try to remove it anyway
								user.remove(function(err, result) {
									if(err) {
										res.send(406, stderr);
									}
									if(result) {
										res.send(200, user);
									}
								});
							}
							else {
								user.remove(function(err, result) {
									res.send(200, user);
								});
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

exports.getBackups = function(req, res) {
	var databaseid = req.params.id;
	Backup.find({database: databaseid})
	.populate("author")
	.populate("database")
	.exec(function(err, results) {
		if(err) res.send(500, err);
		if(results) res.send(200, results);
	});
}

exports.getBackup = function(req, res) {
	var databaseid = req.params.id;
	var backupid = req.params.backupid;

	if(databaseid && backupid) {
		Backup.findOne({_id: backupid})
		.exec(function(err, result) {
			if(err) res.send(500, err);
			if(result) res.send(200, result);
			else {
				res.send(404);
			}
		});
	}
	else {
		res.send(404);
	}
}

exports.postCreateBackup = function(req, res) {
	var databaseid = req.params.id;
	var body = req.body;
	var backupsDirectory = config.directoryUploads;

	if(body.name && databaseid && body.format) {
		var options ={
			name: body.name,
			databaseid: databaseid,
			author: req.user,
			format: body.format,
			backupsDirectory: backupsDirectory
		};

		var backup = new BackupLib(options);
		backup.on("backup:error", function(err) {
			app.emit("backup:error", err);
		});

		backup.on("backup:done", function(result) {
			app.emit("backup:done", result);
		});

		backup.init(function(err, backup) {
			if(err) return res.send(400, err);
			return res.send(201, backup);
		});
	}
	else {
		res.send(406, "Name and database are required");
	}
}

exports.deleteBackup = function(req, res) {

}

/**
 * Administer permissions
 */
exports.postPermissions = function(req, res) {
	var body = req.body;

	var user = body.user;
	var permission = body.permission;
	var op = body.op;
	var database = body.database;

	console.log(body);

	function validate(next) {
		if(!body.user) {
			res.send(406, "The user to add is missing");
		}
		if(!body.permission) {
			res.send(406, "The permission to add is missing");
		}
		if(!body.op) {
			res.send(406, "No operation set");
		}
		if(!body.database) {
			res.send(406, "No database");
		}

		next();
	}

	validate(function() {
		if(op == "add") {

			switch(permission) {
				case "view":
					var query = Database.update({_id: database}, {$addToSet: {
						"permissions.view": user
					}});
				break;

				case "edit":
					var query = Database.update({_id: database}, {$addToSet: {
						"permissions.edit": user
					}});
				break;

				case "import":
					var query = Database.update({_id: database}, {$addToSet: {
						"permissions.import": user
					}});
				break;

				case "remove":
					var query = Database.update({_id: database}, {$addToSet: {
						"permissions.remove": user
					}});
				break;
			}

			query.exec(function(err, result) {
				if(err) {
					console.log("ERROR");
					console.log(err);
					res.send(406, err);
				}
				if(result) {
					console.log("RESULT");
					console.log(result);
					res.send(200, {result: result});
				}
			});
		}

		if(op == "remove") {
			switch(permission) {
				case "view":
					var query = Database.update({_id: database}, {$pull: {
						"permissions.view": user
					}});
				break;

				case "edit":
					var query = Database.update({_id: database}, {$pull: {
						"permissions.edit": user
					}});
				break;

				case "import":
					var query = Database.update({_id: database}, {$pull: {
						"permissions.import": user
					}});
				break;

				case "remove":
					var query = Database.update({_id: database}, {$pull: {
						"permissions.remove": user
					}});
				break;
			}

			query.exec(function(err, result) {
				if(err) {
					console.log(err);
					res.send(406, err);
				}
				if(result) {
					res.send(200, {result: result});
				}
			});
		}
	});
}
