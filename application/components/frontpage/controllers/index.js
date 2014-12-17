var include = require("includemvc");
var app = include.app();

exports.frontpage = function(req, res) {
	res.render("frontpage", {title: "Express MVC"});
}
