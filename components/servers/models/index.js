var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var Server = mongoose.model("Server", {
	name: String,
	ip: String,
	ssh_username: String,
	ssh_keyPath: String,
	ssh_port: {type: String, default: 22},
	os: String,
	created: {type: Date, default: Date.now},
	author: {type: Schema.Types.ObjectId, ref: "User"},
	services: [{
		type: {type: String},
		username: {type: String},
		password: {type: String},
		port: {type: String}
	}]
});

module.exports = Server;