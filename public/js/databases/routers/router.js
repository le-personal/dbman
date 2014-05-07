define(function(requiere) {
	var Backbone = require("backbone");
	var Marionette = require("marionette");

	return Backbone.Marionette.AppRouter.extend({
		appRoutes: {
		  "": "viewDatabases", // call the method viewServers in the controller, which will be passed when instantiating the router
			"view/:id": "router_viewDatabaseView"
		}
	});
});


// App.Routers.DatabasesRouter = Backbone.Router.extend({
// 	initialize: function() {
// 	},
// 	routes: {
// 		"": "listDatabases",
// 		"add": "addDatabase",
// 		"view/:id": "viewDatabase",
// 		"showTables/:id": "showTables",
// 		"showDatabases/:id": "showDatabases",
// 		'listAllUsers': "listAllUsers",
// 		'viewUser/:id': 'viewUser',
// 		'dropUser/:id': "dropUser",
// 		'showUsersInDatabase/:id': 'showUsersInDatabase',
// 		'listBackups/:id': "listBackups",
// 		"createBackup/:id": "createBackup",
// 		"import/:id": "import",
// 		"permissions/:id": "permissions"
// 	},
// 	listDatabases: function() {
// 		new App.Views.ListDatabases({el: "div.content"});
// 	},
// 	viewDatabase: function(id) {
// 		new App.Views.ViewDatabase({el: "div#content", id: id});
// 	},
// 	addDatabase: function() {
// 		new App.Views.AddDatabase({el: "div#content"});
// 	},
// 	showTables: function(id) {
// 		new App.Views.ShowTables({el: "div#content", id: id});
// 	},
// 	showDatabases: function(id) {
// 		new App.Views.ShowDatabases({el: "div#content", id: id});
// 	},
// 	listAllUsers: function() {
// 		// not implemented yet
// 		new App.Views.ListAllUsers({el: "div#content", id: id});
// 	},
// 	viewUser: function(id) {
// 		// not implemented yet
// 		new App.Views.ViewDatabaseUser({el: "div#content", id: id});
// 	},
// 	showUsersInDatabase: function(id) {
// 		new App.Views.ShowUsersInDatabase({el: "div#content", id: id});
// 	},
// 	dropUser: function(id) {
// 		new App.Views.DropUser({el: "div#content", id: id});
// 	},
// 	listBackups: function(id) {
// 		new App.Views.ListBackups({el: "div#content", id: id});
// 	},
// 	createBackup: function(id) {
// 		new App.Views.CreateBackup({el: "div#content", id: id});
// 	},
// 	import: function(id) {
// 		new App.Views.Import({el: "div#content", id: id});
// 	},
// 	permissions: function(id) {
// 		new App.Views.Permissions({el: "div#content", id: id});
// 	}
// });