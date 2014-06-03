var include = require("includemvc");
var mongoose = require("mongoose");
var fs = require("fs");
var path = require("path");
var Secure = include.lib("secure")
var Model = include.model("users");

/** 
 * Shows page to create the first user 
 */
exports.getCreateFirstUser = function(req, res) {
	res.render("user", {
		title: "Create the first user"
	})
}

/** 
 * POST, create the first user 
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