var include = require("includemvc");
var mongoose = require("mongoose");
var fs = require("fs");
var path = require("path");
var Secure = include.lib("secure")
var Model = include.model("users");

function SecretKey() {
	this.secretKey = "";
	this.algorithm = "aes256";

	this.get = function() {
		return {
			secretKey: this.secretKey,
			algorithm: this.algorithm
		}
	}

	this.set = function(secretKey) {
		this.secretKey = secretKey;
	}
}

var secretKey = new SecretKey();

exports.getInstallConfig = function(req, res) {
	res.render("config", {
		title: "Welcome to the installer"
	});
}

exports.postInstallConfig = function(req, res) {
	var body = req.body;

	// Save the config file
	function saveConfigFile(data, callback) {
		fs.writeFile(path.join(__dirname, "../../../", "config", "config.json"), JSON.stringify(data), function(err) {
			if(err) {
				req.flash("error", "Can't save the config file, please check that the directory config exists and that it's writeable");
				console.log(err);
				res.redirect("/install/config");
			}
			else {
				callback(err, true);
			}
		})
	} 

	if(!body.secretkey || !body.directoryUploads || !body.mongodburi) {
		req.flash("error", "All fields are required");
		res.redirect("/install/config");
	}
	else {
		var config = {
			mongodburi: body.mongodburi,
			secretKey: body.secretkey,
			directoryUploads: body.directoryUploads,
			enableIO: true,
			components: [
				"users",
				"error",
				"servers",
				"databases",
				"files"
			]
		}


		// save the secureKey
		secretKey.set(config.secretKey);

		mongoose.connect(config.mongodburi);
		var db = mongoose.connection;
		db.on("error", function(data) {
			req.flash("error", "There was a problem connecting to MongoDB, please check your settings");
			res.redirect("/install/config");
		});

		db.on("connected", function(data) {
			saveConfigFile(config, function(err, result) {
				req.flash("success", "Configuration file saved");
				res.redirect("/install/user");
			});
		});

		// setTimeout(function() {
		// 	req.flash("error", "Timeouted while trying to connect to MongoDB, please check your settings");
		// 	res.redirect("/install/config");
		// }, 10000);
	}
}




/** 
 * this 
 */
exports.getCreateFirstUser = function(req, res) {
	res.render("user", {
		title: "Create the first user"
	})
}

/** 
 * this 
 */
exports.postCreateFirstUser = function(req, res) {
	var body = req.body;

	// check if all fields have data
	if(!body.username || !body.email || !body.fullname || !body.password || !body.password2) {
		req.flash("error", "All fields are required");
		res.redirect("/install/user");
	}

	// check if passwords are not equal
	if(body.password !== body.password2) {
		req.flash("error", "Both passwords should be equal");
		res.redirect("/install/user");
	}
	else {
		console.log(secretKey.get());
		var secure = new Secure(secretKey.get());

		var user = {
			username: body.username,
			email: body.email,
			fullName: body.fullname,
			password: secure.encrypt(body.password),
			isAdmin: true
		}

		var model = new Model(user);
		model.save(function(err, result) {
			if(err) {
				console.log(err);
				req.flash("error", err);
				res.redirect("/install/user");
			}

			if(result) {
				console.log(result);
				res.redirect("/install/finish");
			}
		})
	}
}

/** 
 * Success page for the first created user 
 */
exports.getFinish = function(req, res) {
	var render = {
		title: "Finished",
	}

	res.render("finish", render);
	
	setTimeout(function() {
		console.log("Congratulations. DBManager is installed. Please restart the application.")
		process.exit();
	}, 2000);
}