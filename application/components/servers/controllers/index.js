var include = require("includemvc");
var Model = include.model("servers");
var app = include.app();

exports.getServers = function(req, res) {
	Model.find(function(err, results) {
		if(err) throw err;

		var render = {
			title: "Servers",
			servers: results,
			json: JSON.stringify(results)
		}

		res.render("viewServers", render);
	});
}