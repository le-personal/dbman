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
}

module.exports = exports = SSH;

SSH.prototype.execute = function(id, command) {
	var self = this;
	self.connection.on("ready", function() {
		console.log("Executing command: %s", command);
		self.connection.exec(command, function(err, stream) {
			if(err) throw err;
			stream.on("data", function(data, extended) {
				console.log(data);
				app.emit("ssh:execute:data:" + id, {data: data, extended: extended});
			})

			stream.on('end', function() {
	      console.log('Stream :: EOF');

	      app.emit("ssh:execute:end:" + id);
	    });

	    stream.on('close', function() {
	      console.log('Stream :: close');

	      app.emit("ssh:execute:close:" + id);
	    });

	    stream.on('exit', function(code, signal) {
	      console.log('Stream :: exit :: code: ' + code + ', signal: ' + signal);
	      app.emit("ssh:execute:exit:" + id);
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

SSH.prototype.testConnection = function(id) {
	var self = this;
	self.connection.on("ready", function() {
		self.connection.exec("uptime", function(err, stream) {
			if(err) throw err;
			stream.on("data", function(data, extended) {
				app.emit("ssh:testConnection:data:" + id, {data: data, type: extended});
			})

			stream.on('end', function() {
	      console.log('Stream :: EOF');

	      app.emit("ssh:testConnection:end:" +id);
	    });

	    stream.on('close', function() {
	      console.log('Stream :: close');

	      app.emit("ssh:testConnection:close:" + id);
	    });

	    stream.on('exit', function(code, signal) {
	      console.log('Stream :: exit :: code: ' + code + ', signal: ' + signal);
	      app.emit("ssh:testConnection:exit:" + id);
	      self.connection.end();
	    });
		});
	})
}