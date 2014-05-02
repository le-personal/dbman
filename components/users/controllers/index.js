var include = require("includemvc");
var app = include.app();
var Model = include.model("users");
var isAdmin = include.lib("isAdmin", "users");
var Secure = include.lib("secure");
var secure = new Secure();
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

passport.use(new LocalStrategy(
  function(email, password, done) {
    Model.findOne({ email: email }, function(err, user) {
      if (err) { 
      	return done(err); 
      }

      if (!user) {
        return done(null, false, { message: 'Incorrect email.' });
      }

      if (secure.encrypt(password) != user.password) {
        return done(null, false, { message: 'Incorrect password.' });
      }

      return done(null, user);
    });
  }
));

/** 
 * Get Login Page 
 */
exports.getLogin = function(req, res) {
	res.render("login", {
		title: "Log in"
	});
}

/** 
 * Post Login Page 
 */
exports.postLogin = function(req, res) {
	return passport.authenticate('local', { 
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true 
  });
}

exports.getLogout = function(req, res) {
	req.logout();
  res.redirect('/login');
}

/** 
 * this 
 */
exports.getRegister = function(req, res) {
	res.render("register", {
		title: "Register"
	})
}

/** 
 * this 
 */
exports.postRegister = function(req, res) {
	var body = req.body;

	console.log(body);	
}

/** 
 * this 
 */
exports.getPassword = function(req, res) {
	res.render("password", {
		title: "Recover your password"
	})
}

/** 
 * this 
 */
exports.postPassword = function(req, res) {
	var body = req.body;

	console.log(body);
}

/** 
 * Get the settings page 
 */
exports.getSettings = function(req, res) {
	var userId = req.user;
		
	var render = {
		title: "Settings"
	}

	// Get the user information

	Model.findOne({_id: userId}, function(err, result) {
		if(err) {
			throw err;
		}

		if(result) {
			var user = {
				fullName: result.fullName,
				username: result.username,
				email: result.email
			}

			render.user = user;
			res.render("settings", render);
		}

		else {
			res.redirect("/403");
		}
	});
}

/** 
 * Post the settings page 
 */
exports.postSettings = function(req, res) {
	var body = req.body;
	var userId = req.user;

	if(body.username && body.fullName && body.email) {
		Model.update({_id: userId}, {
			username: body.username,
			fullName: body.fullName,
			email: body.email
		}, function (err, result) {
			if(err) {
				throw err;
			}

			if(result) {
				req.flash("success", "All changes were saved");
				res.redirect("/settings");
			}
		});
	}
	else {
		req.flash("error", "All fields are required");
		res.redirect("/settings");
	}

}

/** 
 * this 
 */
exports.getSettingsPassword = function(req, res) {
	var render = {
		title: "Change your password",
	}

	res.render("settingsPassword", render);
}

/** 
 * this 
 */
exports.postSettingsPassword = function(req, res) {
	var userId = req.user;
	var body = req.body;

	// Get current password
	// @return the password encrypted as it is in the database
	function getCurrentPassword(userId, callback) {
		Model.findOne({_id: userId}, function(err, result) {
			if(err) {
				return callback(err, null);
			}

			if(result) {
				return callback(null, result.password);
			}
		})
	}

	// Updates the password
	// @param password The unencrypted password
	function updatePassword(userId, password, callback) {
		var encrypted = secure.encrypt(password);
		Model.update({_id: userId}, {password: encrypted}, function(err, result) {
			return callback(err, result);
		});
	}

	// Handle the error
	function handleError(message) {
		req.flash("error", message);
		res.redirect("/settings/password");
	}

	// All fields are required
	if(body.current && body.newpassword && body.newpassword2) {

		// get the current password to match it with the one provided
		getCurrentPassword(userId, function(err, result) {
			// if the password provided is the same as the one in the database continue
			if(result == secure.encrypt(body.current)) {

				// if both new passwords are the same update
				if(body.newpassword == body.newpassword2) {
					updatePassword(userId, body.newpassword, function(err, result) {
						if(err) {
							handleError("An error ocurred");
							console.log(err);
						}

						if(result) {
							req.flash("success", "Your password was changed successfully");
							res.redirect("/settings/password");
						}
					})
				}

				// the new passwords are not equal
				else {
					handleError("Your new password must be confirmed twice and it does not match");
				}
			}

			// the current password provided is not the same as the one in the database
			else {
				console.log("Error");
				handleError("The password you provided does not match with the one in our records. Please enter your password");
			}
		});
	}

	else {
		// All fields are required
		handleError("You need to enter your current password and the new password twice");
	}
}

/** 
 * this 
 */
exports.getAdminUsers = function(req, res) {
	var render = {
		title: "Administer Users",
	}

	Model.find(function(err, results){
		if(err) {
			throw err;
		}

		if(results) {
			render.users = results;
			
			res.render("adminUsers", render);
		}
	});
}

/** 
 * this 
 */
exports.getAdminCreateUser = function(req, res) {
	var render = {
		title: "Create user"
	}

	res.render("adminCreateUser", render);
}

/** 
 * this 
 */
exports.postAdminCreateUser = function(req, res) {
	var body = req.body;

	var isAdmin = body.isAdmin == "on" ? true : false;

	// Handle the error
	function handleError(message) {
		req.flash("error", message);
		res.redirect("/admin/users/create");
	}

	function findUsername(username, callback) {
		Model.findOne({username: username}, function(err, result) {
			callback(err, result);
		});
	}

	function findEmail(email, callback) {
		Model.findOne({email: email}, function(err, result) {
			callback(err, result);
		});
	}

	function createUser(fullname, username, email, password, isAdmin, callback) {
		var encrypted = secure.encrypt(password);

		var user = {
			fullName: fullname,
			username: username,
			email: email,
			password: encrypted,
			isAdmin: isAdmin
		}

		var model = new Model(user);
		model.save(function(err, result) {
			callback(err, result);
		});
	}

	if(body.fullName && body.username && body.email && body.password) {
		findUsername(body.username, function(err, result) {
			if(err) throw err;
			// there's a user with this username 
			if(result) {
				handleError("There's already a user with that username, please enter another one");
			}
			else {
				findEmail(body.email, function(err, result) {
					if(err) throw err;
					if(result) {
						handleError("There's already a user using that email, please enter another one");
					}
					else {
						createUser(body.fullName, body.username, body.email, body.password, body.isAdmin, function(err, result) {
							if(err) throw err;
							if(result) {
								req.flash("success", "The user was created");
								res.redirect("/admin/users");
							}
						})
					}
				})
			}
		})
	}
	else {
		handleError("All fields are required");
	}
}

/** 
 * this 
 */
exports.getAdminEditUser = function(req, res) {
	var id = req.params.id;

	Model.findOne({_id: id}, function(err, result) {
		if(err) throw err;
		if(result) {
			result.password = null;
			
			var render = {
				title: "Edit user " + result.username,
				user: result
			}

			res.render("adminEditUser", render);
		}
	});

}

/** 
 * this 
 */
exports.postAdminEditUser = function(req, res) {
	var body = req.body;
	var id = req.params.id;

	var isAdmin = body.isAdmin == "on" ? true : false;

	// Handle the error
	function handleError(message) {
		req.flash("error", message);
		res.redirect("/admin/users/edit/" + id);
	}

	function findUsername(username, callback) {
		Model.findOne({username: username}, function(err, result) {
			callback(err, result);
		});
	}

	function findEmail(email, callback) {
		Model.findOne({email: email}, function(err, result) {
			callback(err, result);
		});
	}

	function getUser(id, callback) {
		Model.findOne({_id: id}, function(err, result) {
			callback(err, result);
		});	
	}

	function updateUser(id, fullname, username, email, password, isAdmin, callback) {
		var user = {
			fullName: fullname,
			username: username,
			email: email,
			isAdmin: isAdmin
		}
		
		if(password) {
			var encrypted = secure.encrypt(password);
			user.password = encrypted;
		}

		Model.update({_id: id}, user, function(err, result) {
			callback(err, result);
		});
	}

	if(body.username && body.email && body.fullName) {
		if(body.password) {
			// Change the password

		}
	// 	else {
	// 		getUser(id, function(err, result) {
	// 			if(err) throw err;
	// 			if(result) {
	// 				// the username is changing, check if the new one is available
	// 				if(body.username != result.username) {
	// 					findUsername(body.username, function(err, username) {
	// 						if(err) throw err;
	// 						if(username) {
	// 							handleError("The username you provided already exists");
	// 						}
	// 						else {

	// 						}
	// 					});
	// 				}
	// 			}
	// 		})
	// 	}
	}
	else {
		handleError("All fields are required");
	}
}

/** 
 * this 
 */
exports.getAdminDeleteUser = function(req, res) {
	var id = req.params.id;
	Model.findOne({_id: id}, function(err, user) {
		if(err) res.redirect("/404");
		if(user) {
			var render = {
				title: "Are you sure you want to delete the user: " + user.username,
				user: user
			}

			res.render("adminDeleteUser", render);
		}
		else {
			res.redirect("/404");
		}
	});
}

/** 
 * this 
 */
exports.postAdminDeleteUser = function(req, res) {
	var body = req.body;
	var id = req.params.id;

	Model.remove({_id: id}, function(err, result) {
		if(err) {
			req.flash("danger", "There was an error");
		}

		if(result) {
			req.flash("success", "The user was removed successfully");
		}

		res.redirect("/admin/users");
	});
}

exports.apiGetUsers = function(req, res) {
	Model.find()
	.exec(function(err, users) {
		if(err) {
			res.send(406, err);
		}
		if(users) {
			res.send(200, users);
		}
	});
}