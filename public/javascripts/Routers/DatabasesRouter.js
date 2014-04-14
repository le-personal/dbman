App.Routers.DatabasesRouter = Backbone.Router.extend({
	initialize: function() {
	},
	routes: {
		"": "listDatabases",
		"add": "addDatabase",
		"view/:id": "viewDatabase",
		"edit/:id": "editDatabase",
		"delete/:id": "deleteDatabase",
		"showTables/:id": "showTables",
		"showDatabases/:id": "showDatabases",
		"lock/:id": "lockDatabase",
		"unlock/:id": "unlockDatabase",
		'listAllUsers': "listAllUsers",
		'viewUser/:id': 'viewUser',
		'addUser/:id': 'addUser',
		'dropUser/:id': "dropUser",
		'showUsersInDatabase/:id': 'showUsersInDatabase'
	},
	listDatabases: function() {
		new App.Views.ListDatabases({el: "div#content"});
	},
	viewDatabase: function(id) {
		new App.Views.ViewDatabase({el: "div#content", id: id});
	},
	addDatabase: function() {
		new App.Views.AddDatabase({el: "div#content"});
	},
	editDatabase: function(id) {
		// new App.Views.EditServer({el: "div#content", id: id});
	},
	deleteDatabase: function(id) {
		new App.Views.DeleteDatabase({el: "div#content", id: id});
	},
	showTables: function(id) {
		new App.Views.ShowTables({el: "div#content", id: id});
	},
	showDatabases: function(id) {
		new App.Views.ShowDatabases({el: "div#content", id: id});
	},
	lockDatabase: function(id) {
		new App.Views.LockDatabase({el: "div#content", id: id});
	},
	unlockDatabase: function(id) {
		new App.Views.UnlockDatabase({el: "div#content", id: id});
	},
	listAllUsers: function() {
		// not implemented yet
		new App.Views.ListAllUsers({el: "div#content", id: id});
	},
	viewUser: function(id) {
		// not implemented yet
		new App.Views.ViewDatabaseUser({el: "div#content", id: id});
	},
	addUser: function(id) {
		new App.Views.AddDatabaseUser({el: "div#content", id: id});
	},
	showUsersInDatabase: function(id) {
		new App.Views.ShowUsersInDatabase({el: "div#content", id: id});
	},
	dropUser: function(id) {
		new App.Views.DropUser({el: "div#content", id: id});
	}
});