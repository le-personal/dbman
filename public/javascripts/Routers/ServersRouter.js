App.Routers.ServersRouter = Backbone.Router.extend({
	initialize: function() {
	},
	routes: {
		"": "listServers",
		"add": "addServer",
		"view/:id": "viewServer",
		"edit/:id": "editServer",
		"delete/:id": "deleteServer",
		"testConnection/:id": "testConnectionServer",
	},
	listServers: function() {
		new App.Views.ListServers({el: "div#content"});	
	},
	viewServer: function(id) {
		new App.Views.ViewServer({el: "div#content", id: id});
	},
	addServer: function() {
		new App.Views.AddServer({el: "div#content"});
	},
	editServer: function(id) {
		new App.Views.EditServer({el: "div#content", id: id});
	},
	deleteServer: function(id) {
		new App.Views.DeleteServer({el: "div#content", id: id});
	},
	testConnectionServer: function(id) {
		new App.Views.TestConnectionServer({el: "div#content", id: id});
	},
});