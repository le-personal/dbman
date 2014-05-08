define(function(require) {
	var Backbone = require("backbone");

	var DatabasesUser = Backbone.Model.extend({
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