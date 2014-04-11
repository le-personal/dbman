App.Collections.Servers = Backbone.Collection.extend({
	model: App.Models.Server,
	url: "/api/servers"
});