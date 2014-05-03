var include = require("includemvc");
var SSH = include.lib("ssh");
var MySQL = include.lib("mysql", "databases");
var Server = include.model("servers");
var app = include.app();
var util = require("util");
var models = include.model("databases");
var Database = models.Database;
var DatabaseUser = models.DatabaseUser;
var Backup = models.Backup;
var Connection = include.lib("connection");
var _ = require("underscore");

exports.getDatabases = function(req, res) {
	Database.find()
	.populate("server")
	.populate("author")
	.populate("permissions.view")
	.populate("permissions.edit")
	.populate("permissions.import")
	.populate("permissions.remove")
	.exec(function(err, databases) {
		if(err) {
			res.redirect("/404")
		}
		if(databases) {
			var results = [];
			var total = databases.length;
			var count = 0;

			if(total > 0) {
				databases.forEach(function(database) {
					// get each databaseuser
					DatabaseUser.find({database: database._id})
					.exec(function(err, users) {
						// backups
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
								var render = {
									title: "Databases",
									databases: results,
									json: JSON.stringify(results)
								}

								res.render("listDatabases", render)
							}
						});	
					});
				});
			}
			else {
				var render = {
					title: "Databases",
					databases: [],
					json: JSON.stringify([])
				}
				res.render("listDatabases", render);
			}
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

				var render = {
					title: "List Databases on server " + server.name,
					server: server,
					data: "Nothing to show here"
				}

				res.render("genericResponse", render);
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
			res.send(404);
		}

		if(database) {
			if(database.database_type == "mysql") {
				res.send(200);
				
				var mysql = new MySQL({
					hostname: server.ip,
					username: server.service.username,
					password: server.service.password,
					port: server.service.port
				});
				
				var connection = new Connection(database._id, server);
				connection.execute(mysql.showTables(database.database_name));
				
				// var render = {
				// 	title: "Show tables from database " + database.database_name,
				// 	server: server,
				// 	data: "Nothing to show here"
				// }

			}
			else {
				res.send(404);
				// res.redirect("/404");
			}
		}
		else {
			res.send(404);
		}
	});
}