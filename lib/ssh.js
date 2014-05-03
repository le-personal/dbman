var Connection = require("ssh2");
var include = require("includemvc");
var app = include.app();

function SSH(connectionOptions) {
	var options = {
		host: connectionOptions.host,
		port: connectionOptions.port,
		username: connectionOptions.username,
		privateKey: require("fs").readFileSync(connectionOptions.privateKey)
	}

	this.connection = new Connection();
	this.connection.connect(options);
	this.data = null;
}

module.exports = exports = SSH;

SSH.prototype.execute = function(id, command) {
	var self = this;
	var stdout = "";
	var stderr = "";

	self.connection.on("ready", function() {
		self.connection.exec(command, function(err, stream) {
			if(err) {
				res.send(500);
			}

			stream.on("data", function(data, extended) {
				if(extended === "stderr") {
					stderr += data;
				}
				
				else {
					stdout += data;
				}

				app.emit("ssh:execute:data", {
					stderr: stderr,
					stdout: stdout,
					id: id,
				});
			})

			stream.on('end', function() {
	      app.emit("ssh:execute:end", {id: id, stdout: stdout, stderr: stderr});
	    });

	    stream.on('close', function() {
	      app.emit("ssh:execute:close", {id: id});
	    });

	    stream.on('exit', function(code, signal) {
	      app.emit("ssh:execute:exit", {id: id});
	      self.connection.end();
	    });
		});
	})
}

SSH.prototype.executeAsync = function(id, command, callback) {
	var self = this;
	var stdout = "";
	var stderr = "";

	self.connection.on("ready", function() {
		console.log("SSH: Executing command");
		console.log(command);
		self.connection.exec(command, function(err, stream) {
			if(err) {
				callback(err, null);
			}

			stream.on("data", function(data, extended) {
				if(extended === "stderr") {
					stderr += data;
				}
				
				else {
					stdout += data;
				}

				app.emit("ssh:execute:data", {
					stderr: stderr,
					stdout: stdout,
					id: id,
				});
			})

			stream.on('end', function() {
				console.log("End");
				app.emit("ssh:execute:end", {id: id, stdout: stdout, stderr: stderr});
	    });

	    stream.on('close', function() {
	      console.log("close connection");
	      callback(stderr, stdout);
	    });

	    stream.on('exit', function(code, signal) {
	    	console.log("exit connection");
	      self.connection.end();
	    });
		});
	})
}

SSH.prototype.upload = function(localFilepath, remoteFilepath) {
	var self = this;
	self.connection.on("ready", function() {
		self.connection.sftp(function(err, sftp) {
			if(err) {
				res.send(500, err);
			}

			sftp.on("end", function() {
				app.emit("ssh:upload:end");
			});

			sftp.fastPut(localFilepath, remoteFilepath, function(err) {
				if(err) {
					res.send(500, err);
				}
				app.emit("ssh:upload:fastPut");
			});
		});
	})
}

SSH.prototype.uploadAsync = function(localFilepath, remoteFilepath, callback) {
	var self = this;
	self.connection.on("ready", function() {
		self.connection.sftp(function(err, sftp) {
			if(err) {
				res.send(500, err);
			}

			sftp.on("end", function() {
				console.log("END");
				app.emit("ssh:upload:end");
			});

			sftp.fastPut(localFilepath, remoteFilepath, function(err) {
				if(err) callback(err, false);
				
				app.emit("ssh:upload:fastPut");
				return callback(err, true);
			});
		});
	})
}

SSH.prototype.download = function(remoteFilepath, localFilepath) {
	var self = this;
	self.connection.on("ready", function() {
		self.connection.sftp(function(err, sftp) {
			if(err) {
				res.send(500, err);
			}

			sftp.on("end", function() {
				app.emit("ssh:upload:end");
			});

			sftp.fastGet(localFilepath, remoteFilepath, function(err) {
				if(err) {
					res.send(500, err);
				}
				app.emit("ssh:upload:fastGet");
			});
		});
	})
}

SSH.prototype.downloadAsync = function(remote, local, callback) {
	var self = this;
	self.connection.on("ready", function() {
		self.connection.sftp(function(err, sftp) {
			if(err) {
				callback(err, null);
			}

			sftp.on("end", function() {
				console.log("END");
				app.emit("ssh:download:end");
			});

			sftp.fastGet(remote, local, function(err) {
				if(err) callback(err, false);
				
				app.emit("ssh:download:fastPut");
				return callback(err, true);
			});
		});
	})
}