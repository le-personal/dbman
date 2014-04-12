App.Collections.Databases = Backbone.Collection.extend({
	model: App.Models.Database,
	url: "/api/databases"
});