
App.Routers.AppRouter = Backbone.Router.extend({
	initialize: function() {
	},
	routes: {
		"databases": "databasesList",
		"databases/:id": "databaseView",
		"databases/:id/tables": "databaseShowTables",
		"servers": "serversList"
	},
	databasesList: function() {
		console.log("called databasesList");
	},
	databaseView: function(id) {
		console.log("called databaseView");
	},
	databaseShowTables: function(id) {
		new App.Views.SocketView({id: id});
	},
	serversList: function() {
		console.log("called serversList");
	}
});

(function() {
	new App.Routers.AppRouter();
	Backbone.history.start({pushState: true});
})();