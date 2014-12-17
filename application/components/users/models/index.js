var mongoose = require("mongoose");

var User = mongoose.model("User", {
	username: String,
	password: String,
	email: String,
	fullName: String,
	created: {type: Date, default: Date.now},
	isAdmin: {type: Boolean, default: false}
});


module.exports = User;