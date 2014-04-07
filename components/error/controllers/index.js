exports.error = function(req, res) {
	res.render("error", {title: "Ups! An error occurred"});
}

exports.notFound = function(req, res) {
	res.render("404", {title: "Page not found"});
}

exports.accessDenied = function(req, res) {
	res.render("403", {title: "Access denied"});
}