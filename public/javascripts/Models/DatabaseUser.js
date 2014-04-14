App.Models.DatabaseUser = Backbone.Model.extend({
	urlRoot: "/api/databases/users",
	defaults: {
		username: '',
		password: '',
		allowedHosts: [],
		created: '',
		database: ''
	}
});