var include = require("includemvc");
var Model = include.model("users");

/** 
 * Needs to be used with isUser first 
 */
module.exports = function(req, res, next) {
	var userId = req.user;

	Model.findOne({_id: userId}, function(err, user) {
		if(err) {
			res.send(403);
		}

		if(user.isAdmin) {
			next();
		}

		else {
			res.send(404);
		}
	})
}