App.Models.Database = Backbone.Model.extend({
	urlRoot: "/api/databases",
	defaults: {
		database_name: "",
		created: '',
		database_user: "",
		database_password: '',
		server: '',
		author: '',
		permissions: {
			edit: [],
			import: [],
			restore: [],
			backup: [],
			remove: []
		},
		isLocked: false,
		allowedHosts: []
	}
});
