function getServersCollection() {
	// Get te servers prepopulated in a template that prints JSON
	var servers = _.template($("#servers").html());
	var collection = new App.Collections.Servers();

	// Add the servers (JSON) to the collection
	collection.reset(JSON.parse(servers()));

	return collection;
}

App.Views.ListServers = Backbone.View.extend({
	template: _.template($("#serverRowTemplate").html()),
	collection: "",
	initialize: function() {
		var self = this;

		// bind the view to the events render and addAll
		_.bindAll(this, "render", "addAll");

		// hide the loading and set the breadcrumb
		app.loading.hide();
		app.breadcrumb.hide();

		// get the servers prepopulated from the JSON in the HTML
		var servers = _.template($("#servers").html());

		// instantiate a new collection
		this.collection = new App.Collections.Servers();

		// bind the reset event to the addAll method of this view
		this.collection.bind("reset", this.addAll);

		// add the servers from the template to the collection
		this.collection.reset(JSON.parse(servers()));

		// on add, add the new server by triggering render
		this.collection.on("add", this.render, this);
		
	},
	render: function(model) {
		$("tbody#servers-tbody").append(this.template({server: model.toJSON()}));
	},
	addAll: function() {
		// for each model in the collection, trigger render
		this.collection.each(this.render);
	}
});

App.Views.ViewServer = Backbone.View.extend({
	template: _.template($("#viewServerTemplate").html()),
	id: null,
	collection: getServersCollection(),
	initialize: function(data) {
		this.id = data.id;
		var self = this;

		// Show the loading
		app.loading.show();

		this.render();
	},
	render: function() {
		var model = this.collection.get(this.id);
		var server = model.toJSON();

		app.title.set("Server " + server.name);

		app.breadcrumb.reset();
		app.breadcrumb.add("Servers", "/servers");
		app.breadcrumb.add(server.name, "#view/"+server._id);
		app.breadcrumb.render();

		// add to DOM
		this.$el.html(this.template({server: server}));
		
		app.loading.hide();
	}
});

App.Views.AddServer = Backbone.View.extend({
	collection: getServersCollection(),
	template: _.template($("#addServerTemplate").html()),
	events: {
		"click .submit": "save"
	},
	initialize: function() {
		this.render();
	},
	render: function() {

		app.title.set("Add server");

		app.breadcrumb.reset();
		app.breadcrumb.add("Servers", "/servers");
		app.breadcrumb.add("Add server");
		app.breadcrumb.render();

		this.$el.html(this.template());
	},
	save: function(e) {
		e.preventDefault();
		var self = this;
		app.loading.show();

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
				app.loading.hide();
			},
			error: function(model, response, xhr) {
				new App.Views.Message({type: "danger", message: response.responseText});
				// app.navigate("/");
				app.loading.hide();
			}
		});
	}
});

App.Views.TestConnectionServer = Backbone.View.extend({
	id: null,
	template: _.template($("#genericResponse").html()),
	dataTemplate: _.template($("#genericData").html()),
	collection: getServersCollection(),
	model: null,
	initialize: function(data) {
		app.loading.show();
		this.id = data.id;
		this.model = this.collection.get(this.id);
		var server = this.model.toJSON(); 

		app.title.set("Test connection to server " + server.name);

		app.breadcrumb.reset();
		app.breadcrumb.add("Servers", "/servers");
		app.breadcrumb.add(server.name, "#view/"+server._id);
		app.breadcrumb.add("Test connection");
		app.breadcrumb.render();

		this.listen();
		this.render();

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

		var model = this.model;

		// call testConnection and pass the id
		// the model will make a post request passing the id in the body
		model.testConnection(this.id);

		// the model will fire a success or error event on completion
		model.on("testConnection:success", function(data) {
			// once we have the response we can display the data of stdout
			// if we made a Sync operation, we use the method listen
			self.$el.html(self.dataTemplate({stdout: data.stdout, stderr: data.stderr}));

			alert.success("The server successfully returned a response");
			app.loading.hide();
		})

		model.on("testConnection:error", function(err) {
			alert.error(err.responseText);
		})
	}
});

App.Views.DeleteServer = Backbone.View.extend({
	id: null,
	initialize: function(data) {
		app.loading.show();

		this.id = data.id;
		this.render();
	},
	render: function() {
		var self = this;
		var model = new App.Models.Server({id: this.id});

		model.destroy({
			success: function() {
				$(".server-" + self.id).hide().remove();
				alert.success("Removed the server successfully");
				app.loading.hide();
			},
			error: function(model, response) {
				alert.error(response.responseText);
			}
		});
	}
});