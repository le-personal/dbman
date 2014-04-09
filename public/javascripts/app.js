
App.Routers.AppRouter = Backbone.Router.extend({
	initialize: function() {
	},
	routes: {
		"databases": "databasesList",
		"databases/:id": "databaseView",
		"tables/:id": "databaseShowTables",
		"servers": "serversList",
		"server/:id": "serverView",
		"testServer/:id": "testServer"
	},
	databasesList: function() {
		console.log("called databasesList");
	},
	databaseView: function(id) {
		console.log("called databaseView");
	},
	databaseShowTables: function(id) {
		new App.Views.ShowTables({el: "div#content", id: id});
	},
	serversList: function() {
		console.log("called serversList");
	},
	testServer: function(id) {
		new App.Views.TestServerConnection({el: "div#content", id: id});
	},
	serverView: function(id) {
		console.log("View server");
	}
});

(function() {
	new App.Routers.AppRouter();
	Backbone.history.start({pushState: false});
})();