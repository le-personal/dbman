define(['backbone', 'marionette', "/js/servers/controller.js"], function(Backbone, Marionette, Controller) {
	return Backbone.Marionette.AppRouter.extend({
		appRoutes: {
		  "": "viewServers" // call the method viewServers in the controller, which will be passed when instantiating the router
		}
	});
});


// App.Routers.Backbone = ServersRouter.Router.extend({
// 	initialize: function() {
// 		var self = this;
// 		self.menu = new App.Menu();
// 		self.menu.mainmenu("servers");
// 	},
// 	routes: {
// 		"": "listServers",
// 		"add": "addServer",
// 		"view/:id": "viewServer",
// 		"edit/:id": "editServer",
// 		"delete/:id": "deleteServer",
// 		"testConnection/:id": "testConnectionServer",
// 	},
// 	listServers: function() {
// 		new App.ResetMessage();
// 		new App.Views.ListServers({el: "div#content"});	
// 	},
// 	viewServer: function(id) {
// 		new App.ResetMessage();
// 		new App.Views.ViewServer({el: "div#content", id: id});
// 	},
// 	addServer: function() {
// 		new App.ResetMessage();
// 		this.menu.localmenu("add");
// 		new App.Views.AddServer({el: "div#content"});
// 	},
// 	editServer: function(id) {
// 		new App.ResetMessage();
// 		new App.Views.EditServer({el: "div#content", id: id});
// 	},
// 	deleteServer: function(id) {
// 		new App.ResetMessage();
// 		new App.Views.DeleteServer({el: "div#content", id: id});
// 	},
// 	testConnectionServer: function(id) {
// 		new App.ResetMessage();
// 		new App.Views.TestConnectionServer({el: "div#content", id: id});
// 	},
// });