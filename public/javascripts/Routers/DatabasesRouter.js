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
		"showDatabases/:id": "showDatabases"
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
	}
});