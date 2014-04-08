var include = require("includemvc");
var SSH = include.lib("ssh");
var MySQL = include.lib("mysql", "databases");
var Server = include.model("servers");
var app = include.app();
var util = require("util");

exports.listMySQLDatabases = function(req, res) {
	var serverId = req.params.id;

	Server.findOne({_id: serverId}, function(err, server) {
		if(err) {
			res.redirect("/404");
		}

		if(server) {
			console.log(server);

			server.services.forEach(function(service) {
				if(service.type === "mysql") {
					console.log(service);
					var mysql = new MySQL({
						hostname: server.ip,
						username: service.username,
						password: service.password,
						port: service.port
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
			});
		}
	});
}