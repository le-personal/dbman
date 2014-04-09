var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var Database = mongoose.model("Database", {
	database_name: String,
	database_type: String,
	created: {type: Date, default: Date.now},
	database_user: String,
	database_password: String,
	server: {type: Schema.Types.ObjectId, ref: "Server"},
	author: {type: Schema.Types.ObjectId, ref: "User"},
	permissions: {
		edit: [{type: Schema.Types.ObjectId, ref: "User"}],
		export: [{type: Schema.Types.ObjectId, ref: "User"}],
		import: [{type: Schema.Types.ObjectId, ref: "User"}],
		restore: [{type: Schema.Types.ObjectId, ref: "User"}],
		backup: [{type: Schema.Types.ObjectId, ref: "User"}],
		remove: [{type: Schema.Types.ObjectId, ref: "User"}],
	},
	isLocked: {type: Boolean, default: false},
	allowedHosts: [{type: String}]
});

var Backup = mongoose.model("Backup", {
	name: {type: String},
	created: {type: Date, default: Date.now},
	author: {type: Schema.Types.ObjectId, ref: "User"},
	fileName: {type: String},
	filePath: {type: String},
	database: {type: Schema.Types.ObjectId, ref: "Database"},
	type: {type: String},
	format: {type: String},
	strategy: {type: String},
	status: {type: String},
	expires: {type: Date}
});

module.exports = exports = {
	Database: Database,
	Backup: Backup
}