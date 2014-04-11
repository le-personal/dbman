
App.Routers.AppRouter = Backbone.Router.extend({
	initialize: function() {
	},
	routes: {
		"databases": "databasesList",
		"databases/:id": "databaseView",
		"tables/:id": "databaseShowTables",
		"servers": "serversList",
		"/servers/:id": "serverView",
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
	viewServer: function(id) {
		console.log("View server");
	}
});

App.Views.Message = Backbone.View.extend({
	el: $("#message"),
	template: _.template($("#messageTemplate").html()),
	initialize: function(data) {
		this.type = data.type;
		this.message = data.message;

		this.render();
	},
	render: function() {
		this.$el.html(this.template({type: this.type, message: this.message}));
	}
});

(function() {
	new App.Routers.AppRouter();
	// Backbone.history.start({pushState: false});
})();