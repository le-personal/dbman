define(function(require) {
	var Backbone = require("backbone");
	var Database = require("/js/databases/models/database.js");

	var Databases = Backbone.Collection.extend({
		model: Database,
		url: "/api/databases"
	});

	return Databases;
});