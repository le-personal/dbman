App.Views.ViewServer = Backbone.View.extend({
	template: _.template($("#viewServerTemplate").html()),
	id: null,
	initialize: function(data) {
		this.id = data.id;
		
		// render the view
		this.render();
	},
	render: function() {
		var self = this;
		
		this.model = new App.Models.Server({id: this.id});
		this.model.fetch({
			success: function(model) {
				var server = model.toJSON();
				self.$el.html(self.template({server: server}));
			}
		});
	}
});

App.Views.AddServer = Backbone.View.extend({
	template: _.template($("#addServerTemplate").html()),
	events: {
		"click .submit": "save"
	},
	initialize: function() {
		this.render();
		this.changeTitle();
		this.changeActiveMenu();
	},
	changeTitle: function() {
		$("h1").text("Add server");
	},
	changeActiveMenu: function() {
		$("ul.nav > li.active").removeClass("active");
		$("ul.nav > li.add").addClass("active");
	},
	render: function() {
		this.$el.html(this.template());
	},
	save: function(e) {
		e.preventDefault();
		var self = this;

		var data = {
			name: $('input[name="name"]').val(),
			ip: $('input[name="ip"]').val(),
			ssh_username: $('input[name="ssh_username"]').val(),
			ssh_keypath: $('input[name="ssh_keypath"]').val(),
			ssh_port: $('input[name="ssh_port"]').val(),
			os: $('select[name="os"]').val(),
			service: {
				type: $('select[name="service[type]"]').val(),
				username: $('input[name="service[username]"]').val(),
				password: $('input[name="service[password]"]').val(),
				port: $('input[name="service[port]"]').val(),
			}
		}

		var model = new App.Models.Server();
		model.save(data, {
			success: function() {				
				new App.Views.Message({type: "success", message: "Created"});
			},
			error: function(model, response, xhr) {
				new App.Views.Message({type: "danger", message: response.responseText});
				// app.navigate("/");
			}
		});
	}
});

App.Views.TestConnectionServer = Backbone.View.extend({
	id: null,
	template: _.template($("#genericResponse").html()),
	dataTemplate: _.template($("#genericData").html()),
	initialize: function(data) {
		this.id = data.id;
		this.listen();
		this.render();
		this.changeTitle();
	},
	changeTitle: function() {
		$("h1").text("Test connection to server");
	},
	listen: function() {
		// it will listen for an event in case we used a Sync / event based call
		var self = this;
		App.io.on("ssh:execute:data:" + self.id, function(data) {
			self.$el.html(self.dataTemplate({stdout: data.stdout}));
		})
	},
	render: function() {
		var self = this;
		this.$el.html(this.template());

		// create a new model
		var model = new App.Models.Server();

		// call testConnection and pass the id
		// the model will make a post request passing the id in the body
		model.testConnection(this.id);

		// the model will fire a success or error event on completion
		model.on("testConnection:success", function(data) {
			// once we have the response we can display the data of stdout
			// if we made a Sync operation, we use the method listen
			self.$el.html(self.dataTemplate({stdout: data.stdout}));
			new App.Views.Message({
				type: "success", 
				message: "The server successfully returned a response"
			});
		})

		model.on("testConnection:error", function() {
			console.log("error");
		})
	}
});

App.Views.EditServer = Backbone.View.extend({

});

App.Views.DeleteServer = Backbone.View.extend({
	id: null,
	initialize: function(data) {
		this.id = data.id;
		this.render();
	},
	render: function() {
		var self = this;
		var model = new App.Models.Server({id: this.id});

		model.destroy({
			success: function() {
				$(".server-" + self.id).hide().remove();
				new App.Views.Message({
					type: "success",
					message: "Removed the server successfully"
				});
			},
			error: function() {
				console.log("Error");
			}
		});
	}
});