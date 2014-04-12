App.Views.ViewDatabase = Backbone.View.extend({
	id: null,
	template: _.template($("#viewDatabaseTemplate").html()),
	initialize: function(data) {
		this.id = data.id;
		this.render();
	},
	render: function() {
		var self = this;
		var model = new App.Models.Database({id: self.id});
		model.fetch({
			success: function(model) {
				var data = model.toJSON();
				self.$el.html(self.template({server: data.server, database: data.database}));
			}
		});
	}
});

App.Views.AddDatabase = Backbone.View.extend({
	template: _.template($("#addDatabaseTemplate").html()),
	servers: new App.Collections.Servers(),
	initialize: function() {
		var self = this;
		
		this.changeActiveMenu();
		this.changeTitle();

		self.servers.fetch({
			success: function(models, response) {
				self.render();
			},
			error: function() {}
		});
	},
	changeTitle: function() {
		$("h1").text("Add database");
	},
	changeActiveMenu: function() {
		$("ul.nav > li.active").removeClass("active");
		$("ul.nav > li.add").addClass("active");
	},
	render: function() {
		var self = this;
		var servers = self.servers.toJSON();
		self.$el.html(self.template({servers: servers}));
	}
});