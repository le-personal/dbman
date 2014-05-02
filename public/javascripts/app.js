
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

/**
 * Provide shortcuts so we can show the message or just do obj.success("message");
 */
App.Views.Message = App.Message = Backbone.View.extend({
	el: $("#message"),
	template: _.template($("#messageTemplate").html()),
	initialize: function(data) {
		if(this.type && this.message) {
			this.type = data.type;
			this.message = data.message;

			this.render();
		}
	},
	render: function() {
		this.$el.html(this.template({type: this.type, message: this.message}));

		// hide the loading
		App.loading.hide();
	},
	show: function(type, message) {
		this.type = type;
		this.message = message;
		this.render();
	},
	error: function(message) {
		this.type = "error";
		this.message = message;

		this.render();
	},
	success: function(message) {
		this.type = "succes";
		this.message = message;
		this.render();
	},
	warning: function(message) {
		this.type = "warning";
		this.message = message;
		this.render();
	},
	info: function(message) {
		this.type = "info";
		this.message = message;
		this.render();
	}
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
	elements: [],
	initialize: function() {
		this.reset();
	},
	render: function() {
		var self = this;
		var elements = self.elements;
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
	hide: function() {
		this.$el.hide();
	},
	reset: function() {
		this.elements = [];
		this.$el.show();
		this.$el.empty();
	},
	set: function(title, link) {
		this.elements.push({title: title, link: link});
	},
	add: function(title, link) {
		this.elements.push({title: title, link: link});
	}
});

App.Title = Backbone.View.extend({
	initialize: function() {
		
	},
	change: function(title) {
		$("h1 > span.title").text(title);
	},
	set: function(title) {
		// every time we change the title reset the message
		new App.ResetMessage();
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
App.loading = app.loading = new App.Views.Loading();
app.breadcrumb = new App.Breadcrumb();
app.alert = alert = new App.Message();
app.title = new App.Title();

(function() {
	new App.Routers.AppRouter();
	// Backbone.history.start({pushState: false});
})();