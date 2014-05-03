App.Models.DatabaseUser = Backbone.Model.extend({
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