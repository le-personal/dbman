define(function(require) {
	var Backbone = require("backbone");
	var DatabaseUser = require("/js/databases/collections/databasesuser.js");

	var DatabaseUsers = Backbone.Collection.extend({
		model: DatabaseUser,
		url: "/api/databases/users"
	});

	return DatabaseUsers;
});