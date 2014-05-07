define(function(require) {
	var Backbone = require("backbone");

	var DatabasesUser = Backbone.Model.extend({
		urlRoot: "/api/databases/users",
		defaults: {
			username: '',
			password: '',
			allowedHosts: [],
			created: '',
			database: ''
		},
		idAttribute: "_id",
	});

	return DatabasesUser;
});