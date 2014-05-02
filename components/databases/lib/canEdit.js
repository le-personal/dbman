var include = require("includemvc");
var models = include.model("databases");
var Database = models.Database;
var User = include.model("users");
var isAdmin = include.lib("isAdmin", "users");
var _ = require("underscore");

function getUser(userId, callback) {
	User.findOne({_id: userId}, function(err, user) {
		if(err) {
			callback(err, false);
		}

		if(user.isAdmin) {
			callback(null, true);
		}

		else {
			callback(true, false);
		}
	})
}

module.exports = exports = function(req, res, next) {
	var id = req.params.id;
	var userId = req.user;

	getUser(userId, function(err, isAdmin) {
		if(isAdmin) {
			next();
		}

		else {
			Database.findOne({_id: id})
			.populate("permissions.edit")
			.exec(function(err, result) {
				if(err) res.send(404);
				if(!result) res.send(404);
				if(result) {
					var total = result.permissions.edit.length;
					var count = 0;

					if(total > 0) {
						result.permissions.edit.forEach(function(user) {
							console.log(user);
							if(user._id == userId) {
								next();
							}
							else {
								count++;
								console.log(count);
								if(count == total) {
									res.send(403);
								}
							}
						})
					}
					else {
						res.send(403);
					}
				}
				else {
					res.send(404);
				}
			});
		}
	})
}