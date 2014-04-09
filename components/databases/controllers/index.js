var include = require("includemvc");
var SSH = include.lib("ssh");
var MySQL = include.lib("mysql", "databases");
var Server = include.model("servers");
var app = include.app();
var util = require("util");

exports.getCreateDatabase = function(req, res) {
	Server.find()
	.exec(function(err, servers) {
		if(err) throw err;
		if(servers) {
			
		}
	});
}

exports.postCreateDatabase = function(req, res) {

}

exports.listMySQLDatabases = function(req, res) {
	var serverId = req.params.id;

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