var include = require("includemvc");
var SSH = include.lib("ssh");
var MySQL = include.lib("mysql", "databases");
var Server = include.model("servers");
var app = include.app();
var util = require("util");
var models = include.model("databases");
var Database = models.Database;

exports.getDatabases = function(req, res) {
	Database.find()
	.populate("server")
	.exec(function(err, results) {
		if(err) throw err;
		if(results) {
			var render = {
				title: "Databases",
				databases: results
			}
			
			res.render("listDatabases", render);	
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
			res.redirect("/404");
		}
		if(result) {
			var render = {
				title: "Database " + result.database_name,
				server: result.server,
				database: result
			}

			res.render("viewDatabase", render);
		}
		else {
			res.redirect("/404");
		}
	});
}

exports.getCreateDatabase = function(req, res) {
	Server.find()
	.exec(function(err, servers) {
		if(err) throw err;
		if(servers) {
			var render = {
				title: "Add database",
				servers: servers,
			}

			res.render("createDatabase", render);
		}
	});
}

exports.postCreateDatabase = function(req, res) {
	var body = req.body;
	var user = req.user;
	var serverId = body.server;

	console.log(body);

	function getDatabase(database_name, serverId, callback) {
		Database.findOne({database_name: database_name, server: serverId}, function(err, result) {
			if(err) throw err;
			if(result) {
				req.flash("error", "The database exists in that server");
				res.redirect("/databases/add");
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
								console.log("Creating database");

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

								app.on("ssh:execute:close:" + result._id, function() {
									req.flash("success", "The database was created successfully on the server");
									res.redirect("/databases");
								});


							}
							else {
								req.flash("success", "The database was added to the database successfully");
								res.redirect("/databases");
							}
						}
						else {
							req.flash("error", "There was an error creating the database");
							res.redirect("/databases");
						}
					});			
				}
			});
		}
	});	
}

exports.listMySQLDatabases = function(req, res) {
	var serverId = req.params.serverid;

	Server.findOne({_id: serverId}, function(err, server) {
		if(err) {
			res.redirect("/404");
		}

		if(server) {
			console.log(server);

			if(server.service.type === "mysql") {
				var mysql = new MySQL({
					hostname: server.ip,
					username: server.service.username,
					password: server.service.password,
					port: server.service.port
				});
				
				var connection = new SSH({
					host: server.ip,
					port: server.ssh_port,
					username: server.ssh_username,
					privateKey: server.ssh_keyPath
				});

				connection.execute(serverId, mysql.showDatabases());

				app.on("ssh:execute:data:" + serverId, function(data) {
					var render = {
						title: "List Databases on server " + server.name,
						server: server,
						data: util.format("%s", data.data)
					}

					res.render("genericResponse", render);
				});
			}
		}
	});
}

exports.showTables = function(req, res) {
	var id = req.params.id;

	Database.findOne({_id: id})
	.populate("server")
	.exec(function(err, database) {
		var serverId = database.server._id;
		var server = database.server;

		if(err) {
			res.redirect("/404");
		}

		if(database) {
			if(database.database_type == "mysql") {
				var mysql = new MySQL({
					hostname: server.ip,
					username: server.service.username,
					password: server.service.password,
					port: server.service.port
				});
				
				var connection = new SSH({
					host: server.ip,
					port: server.ssh_port,
					username: server.ssh_username,
					privateKey: server.ssh_keyPath
				});

				connection.execute(database._id, mysql.showTables(database.database_name));

				app.on("ssh:execute:data:" + database._id, function(data) {
					app.emit("test", data);
				});

				app.emit("test", "data");

				var render = {
					title: "Show tables from database " + database.database_name,
					server: server,
					data: "Nothing to show here"
				}

				res.render("genericResponse", render);
			}
			else {
				res.redirect("/404");
			}
		}
		else {
			res.redirect("/404");
		}
	});
}