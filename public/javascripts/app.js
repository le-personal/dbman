
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

App.ResetMessage = Backbone.View.extend({
	el: $("#message"),
	initialize: function() {
		this.$el.empty();
	}
});

App.Views.Message = App.Message = Backbone.View.extend({
	el: $("#message"),
	template: _.template($("#messageTemplate").html()),
	initialize: function(data) {
		this.type = data.type;
		this.message = data.message;

		this.render();
	},
	render: function() {
		this.$el.html(this.template({type: this.type, message: this.message}));
	},
});


/**
 * Accepts el and active as properties or data
 */
App.Menu = Backbone.View.extend({
	initialize: function(data) {
		
	},
	mainmenu: function(active) {
		$("#navbar ul.nav > li.active").removeClass("active");
		$("#navbar ul.nav > li." + active).addClass("active");
	},
	localmenu: function(active) {
		$("#page ul.nav > li.active").removeClass("active");
		$("#page ul.nav > li." + active).addClass("active");
	}
});

App.Breadcrumb = Backbone.View.extend({
	el: "ol.breadcrumb",
	initialize: function() {
		this.reset();
	},
	add: function(elements) {
		var self = this;
		var total = elements.length;
		var count = 0;
		_.each(elements, function(element) {
			count++;
			if(count == total) {
				self.$el.append("<li><strong>" + element.title + "</strong></li>");
			}
			else {
				self.$el.append("<li><a href='"+ element.link +"'>"+ element.title +"</a></li>");
			}
		})
	},
	reset: function() {
		this.$el.empty();
	}
});

App.Title = Backbone.View.extend({
	initialize: function() {
		
	},
	change: function(title) {
		$("h1").text(title);
	},
	set: function(title) {
		this.change(title);
	}
});

/**
 * Loading div
 */
App.Views.Loading = Backbone.View.extend({
	el: ".loading",
	initialize: function() {

	},
	show: function() {
		$(this.$el).removeClass("hidden");
	},
	hide: function() {
		$(this.$el).addClass("hidden");
	}
});

// Instantiate a loading 
App.loading = new App.Views.Loading();

(function() {
	new App.Routers.AppRouter();
	// Backbone.history.start({pushState: false});
})();