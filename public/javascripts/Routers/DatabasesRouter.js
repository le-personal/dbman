App.Routers.DatabasesRouter = Backbone.Router.extend({
	initialize: function() {
	},
	routes: {
		"": "listDatabases",
		"add": "addDatabase",
		"view/:id": "viewDatabase",
		"edit/:id": "editDatabase",
		"delete/:id": "deleteDatabase",
		"showTables/:id": "showTables"
	},
	listDatabases: function() {
		
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
		// new App.Views.DeleteServer({el: "div#content", id: id});
	},
	showTables: function(id) {

	}
});