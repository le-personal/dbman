var include = require("includemvc");
var Model = include.model("servers");
var Secure = include.lib("secure");
var secure = new Secure();
var SSH = include.lib("ssh");
var app = include.app();

exports.getServers = function(req, res) {
	Model.find(function(err, results) {
		if(err) throw err;

		var render = {
			title: "Servers",
			servers: results
		}

		res.render("listServers", render);
	});
}

exports.getAddServer = function(req, res) {
	var render = {
		title: "Add server"
	}

	res.render("addServer", render);
}

exports.postAddServer = function(req, res) {
	var body = req.body;
	console.log(body);
	var user = req.user;
	if(body.name && body.ip && body.ssh_username && body.ssh_keypath && body.ssh_port && body.os) {
		var server = {
			name: body.name,
			ip: body.ip,
			ssh_username: body.ssh_username,
			ssh_keyPath: body.ssh_keypath,
			ssh_port: body.ssh_port,
			os: body.os,
			author: user,
			service: {
				type: body.service.type,
				username: body.service.username,
				password: secure.encrypt(body.service.password),
				port: body.service.port
			}
		}

		var model = new Model(server);
		model.save(function(err, result) {
			if(err) throw err;
			if(result) {
				req.flash("success", "The server was added successfully");
				res.redirect("/servers");
			}	
		});
	}
	else {
		req.flash("error", "All fields are required");
		res.redirect("/servers/add");
	}
}

exports.getServer = function(req, res) {
	var id = req.params.id;
	Model.findOne({_id: id})
	.populate("author")
	.exec(function(err, result) {
		if(err) {
			res.redirect("/404");
		}
		if(result) {
			var render = {
				title: result.name,
				server: result
			}

			res.render("viewServer", render);
		}
	});
}

exports.getEditServer = function(req, res) {
	
}

exports.postEditServer = function(req, res) {
	
}

/** 
 * this is incomplete, we need to check for backups and all kinds of data
 */
exports.getDeleteServer = function(req, res) {
	var id = req.params.id;
	Model.findOne({_id: id}, function(err, server) {
		if(err) {
			res.redirect("/404");
		}
		if(server) {
			var render = {
				title: "Are you sure you want to delete the server: " + server.name + "?",
				server: server
			}

			res.render("deleteServer", render);
		}
	})
}

exports.postDeleteServer = function(req, res) {
	var id = req.params.id;

	Model.remove({_id: id}, function(err, result) {
		if(err) throw err;
		if(result) {
			req.flash("success", "The server was removed successfully");
			res.redirect("/servers");
		}
	})
}

exports.getTestServer = function(req, res) {
	var id = req.params.id;	

	Model.findOne({_id: id})
	.exec(function(err, result) {
		if(err) {
			res.send(404);
		}
		if(result) {
			res.send(200);

			var options = {
				host: result.ip,
				port: result.ssh_port,
				username: result.ssh_username,
				privateKey: result.ssh_keyPath
			}

			var connection = new SSH(options);
			connection.execute(id, "ps aux");
		}
	});
}