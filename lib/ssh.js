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
			if(err) throw err;
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
		self.connection.exec(command, function(err, stream) {
			if(err) throw err;
			stream.on("data", function(data, extended) {
				if(extended === "stderr") {
					stderr += data;
				}
				
				else {
					stdout += data;
				}
			})

			stream.on('end', function() {
	      callback(stderr, stdout);
	    });

	    stream.on('close', function() {
	      
	    });

	    stream.on('exit', function(code, signal) {
	      self.connection.end();
	    });
		});
	})
}

SSH.prototype.upload = function(localFilepath, remoteFilepath) {
	var self = this;
	self.connection.on("ready", function() {
		self.sftp(function(err, sftp) {
			if(err) throw err;

			sftp.on("end", function() {
				app.emit("ssh:upload:end");
			});

			sftp.fastPut(localFilepath, remoteFilepath, function(err) {
				if(err) throw err;
				app.emit("ssh:upload:fastPut");
			});
		});
	})
}

SSH.prototype.download = function(remoteFilepath, localFilepath) {
	var self = this;
	self.connection.on("ready", function() {
		self.sftp(function(err, sftp) {
			if(err) throw err;

			sftp.on("end", function() {
				app.emit("ssh:upload:end");
			});

			sftp.fastGet(localFilepath, remoteFilepath, function(err) {
				if(err) throw err;
				app.emit("ssh:upload:fastGet");
			});
		});
	})
}