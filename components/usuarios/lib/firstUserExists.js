var include = require("includemvc");
var Model = include.model("users");

module.exports = function(req, res, next) {	
	Model.find(function(err, result) {
		if(err) {
			return res.redirect("/403");
		}

		if(result.length > 0) {
			console.log(result);
			return res.redirect("/403");
		}

		if(result.length == 0) {
			console.log(result);
			return next();
		}
	});
}