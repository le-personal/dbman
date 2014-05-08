define(function(require) {
	var Backbone = require("backbone");
	var DatabasesUser = require("/js/databases/models/databasesuser.js");

	var DatabaseUsers = Backbone.Collection.extend({
		model: DatabasesUser,
		initialize: function(options) {
			this.options = options;
			this.database = this.options.database;
		},
		url: function() {
    	return "/api/databases/" + this.database + '/users';
  	}
	});

	return DatabaseUsers;
});