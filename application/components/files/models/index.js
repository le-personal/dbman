var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var File = mongoose.model("File", {
	filename: String,
	filepath: String,
	created: {type: Date, default: Date.now},
	author: {type: Schema.Types.ObjectId, ref: "User"},
	size: Number,
	type: String,
	extension: String,
	status: {type: String, default: "permanent"}
});

module.exports = File;