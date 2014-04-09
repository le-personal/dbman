App.Controller.prototype.showTables = function(callback) {
	var self = this;

	this.url = function() {
		return "/api/databases/"+ self.id +"/tables";
	}

	this.initialize = function(callback) {
		$.get(self.url(), function(data) {
			console.log(data);
			callback(data);
		})
	}

	this.initialize(callback);
}

App.Views.ShowTables = Backbone.View.extend({
	template: _.template($("#genericResponse").html()),
	dataTemplate: _.template($("#genericData").html()),
	initialize: function(data) {
		console.log(data);
		this.listen();
		this.render(data);
	},
	listen: function() {
		var self = this;

		App.io.on("ssh:execute:data", function(data) {
			self.$el.append(self.dataTemplate({stdout: data.stdout}));
		})
	},
	render: function(data) {
		var self = this;
		var controller = new App.Controller(data.id);
		controller.showTables(function(data) {
			self.$el.html(self.template());
		})
	}
});

App.Controller.prototype.testServerConnection = function(callback) {
	var self = this;

	this.url = function() {
		return "/api/servers/"+ self.id +"/test";
	}

	this.initialize = function(callback) {
		$.get(self.url(), function(data) {
			console.log(data);
			callback(data);
		})
	}

	this.initialize(callback);
}

App.Views.TestServerConnection = Backbone.View.extend({
	template: _.template($("#genericResponse").html()),
	dataTemplate: _.template($("#genericData").html()),
	initialize: function(data) {
		console.log("Initialized test server connection");
		this.listen();
		this.render(data);
	},
	listen: function() {
		var self = this;

		App.io.on("ssh:execute:data", function(data) {
			self.$el.append(self.dataTemplate({stdout: data.stdout}));
		})
	},
	render: function(data) {
		var self = this;
		var controller = new App.Controller(data.id);
		controller.testServerConnection(function(data) {
			self.$el.html(self.template({data: data}));
		})
	}
});