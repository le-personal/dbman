define(function(require) {
	var Backbone = require("backbone");
	var User = require("/js/users/models/user.js");

	var Users = Backbone.Collection.extend({
		model: User,
		url: "/api/users"
	});
	
	return Users;
});