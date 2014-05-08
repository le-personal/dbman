define(function(require) {
	var Backbone = require("backbone");

	var DatabasesUser = Backbone.Model.extend({
		databaseid: null,
		urlRoot: function() {
			return "/api/databases/" + this.databaseid + "users";
		},
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