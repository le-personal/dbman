var include = require("includemvc");
var Model = include.model("servers");
var Secure = include.lib("secure");
var secure = new Secure();
var Connection = include.lib("connection");
var app = include.app();

exports.getServers = function(req, res) {
	Model.find(function(err, results) {
		if(err) throw err;
		if(results) {
			res.send(200, results);
		}
		else {
			res.send(500);
		}
	});	
}

exports.getServer = function(req, res) {
	var id = req.params.id;
	Model.findOne({_id: id})
	.populate("author")
	.exec(function(err, result) {
		if(err) {
			res.send(404);
		}
		if(result) {
			res.send(200, result);
		}
	});
}

exports.postServer = function(req, res) {
	var body = req.body;
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
				res.send(201, result);
			}	
		});
	}
	else {
		res.send(406);
	}
}

exports.putServer = function(req, res) {
	var id = req.params.id;

	console.log("updating %s", id);

	res.send(201);
	// var model = new Model();
	// model.save(function(err, result) {
	// 	if(err) throw err;
	// 	if(result) {
	// 		res.send(201, result);
	// 	}	
	// });
}

exports.deleteServer = function(req, res) {
	var id = req.params.id;

	if(id) {
		console.log("Removing " + id),
		Model.remove({_id: id}, function(err, result) {
			if(err) throw err;
			if(result) {
				res.send(200, true);
			}
		})
	}
	else {
		res.send(404);
	}
}


exports.postTestServer = function(req, res) {
	var id = req.body.id;

	if(req.body.id) {
		Model.findOne({_id: id})
		.exec(function(err, server) {
			if(err) {
				res.send(404);
			}
			if(server) {
				
				// async version
				var connection = new Connection(id, server);
				connection.executeAsync("ps aux", function(stderr, stdout) {
					res.send(200, {stdout: stdout, stderr: stderr});
				});
				
				// sync version 
				//connection.execute("ps aux");
				//res.send(200, true);
			}
		});
	}
	else {
		res.send(406);
	}
}