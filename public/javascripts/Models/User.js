App.Models.User = Backbone.Model.extend({
	urlRoot: "/api/users",
	defaults: {
		username: "",
		password: "",
		email: "",
		fullName: "",
		created: "",
		isAdmin: ""
	},
	idAttribute: "_id"
});