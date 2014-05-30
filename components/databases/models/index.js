var mongoose = require("mongoose");
var Schema = mongoose.Schema;

/** 
 * The list of actions that a user can perform in a database are:
 - view: this includes showing tables, showing users, creating and listing backups
 - edit: this includes adding users, removing users, locking and unlocking the database
 - import: includes the import permission
 - remove: remove the database
 */
var Database = mongoose.model("Database", {
	database_name: String,
	database_type: String,
	description: String,
	created: {type: Date, default: Date.now},
	server: {type: Schema.Types.ObjectId, ref: "Server"},
	author: {type: Schema.Types.ObjectId, ref: "User"},
	permissions: {
		view: [{type: Schema.Types.ObjectId, ref: "User"}],
		edit: [{type: Schema.Types.ObjectId, ref: "User"}],
		import: [{type: Schema.Types.ObjectId, ref: "User"}],
		remove: [{type: Schema.Types.ObjectId, ref: "User"}],
	},
	isLocked: {type: Boolean, default: false},
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
	url: {type: String},
	status: {type: String},
	strategy: {type: String}, // used mainly with mongodb to select if this is a mongodump or a mongoexport
	expires: {type: Date}
});

var DatabaseUser = mongoose.model("DatabaseUser", {
	username: String,
	password: String,
	allowedHosts: [{type: String}],
	created: {type: Date, default: Date.now},
	database: {type: Schema.Types.ObjectId, ref: "DatabaseUser"}
})

module.exports = exports = {
	Database: Database,
	Backup: Backup,
	DatabaseUser: DatabaseUser
}