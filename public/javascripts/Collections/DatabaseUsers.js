App.Collections.DatabaseUsers = Backbone.Collection.extend({
	model: App.Models.DatabaseUser,
	url: "/api/databases/users"
});