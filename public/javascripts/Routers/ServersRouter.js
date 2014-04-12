App.Routers.ServersRouter = Backbone.Router.extend({
	initialize: function() {
	},
	routes: {
		"": "listServers",
		"add": "addServer",
		"view/:id": "viewServer",
		"testConnection/:id": "testConnectionServer",
		"edit/:id": "editServer"
	},
	listServers: function() {
		console.log("called serversList");
	},
	viewServer: function(id) {
		new App.Views.ViewServer({el: "div#content", id: id});
	},
	addServer: function(id) {
		new App.Views.AddServer({el: "div#content", id: id});
	},
	testConnectionServer: function(id) {
		new App.Views.TestConnectionServer({el: "div#content", id: id});
	},
	editServer: function(id) {
		new App.Views.EditServer({el: "div#content", id: id});
	}
});