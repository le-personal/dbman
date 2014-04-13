App.Views.ListDatabases = Backbone.View.extend({
	initialize: function() {
		this.changeMainMenu();
	},
	changeMainMenu: function() {
		$("#navbar ul.nav > li.active").removeClass("active");
		$("#navbar ul.nav > li.databases").addClass("active");
	},
});

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
	events: {
		"click .submit": "save"
	},
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
	},
	save: function(e) {
		e.preventDefault();
		
		var data = {}
		var formValues = $("form").serializeArray();
		_.each(formValues, function(element) {
			data[element.name] = element.value;
		});

		var model = new App.Models.Database();
		model.save(data, {
			success: function(m, response) {
				console.log(m);
				console.log(response);

				new App.Views.Message({type: "success", message: "Database created successfully"});
			},
			error: function(m, response) {
				new App.Views.Message({type: "danger", message: response.responseText});
			}
		})

	}
});



App.Views.DeleteDatabase = Backbone.View.extend({
	id: null,
	initialize: function(data) {
		this.id = data.id;
		this.render();
	},
	render: function() {
		var self = this;
		var model = new App.Models.Database({id: this.id});

		model.destroy({
			success: function() {
				$(".database-" + self.id).hide().remove();
				new App.Views.Message({
					type: "success",
					message: "Removed the database successfully"
				});
			},
			error: function() {
				console.log("Error");
			}
		});
	}
});

App.Views.ShowTables = Backbone.View.extend({
	id: null,
	database: {},
	template: _.template($("#genericResponse").html()),
	dataTemplate: _.template($("#genericData").html()),
	initialize: function(data) {
		this.id = data.id;
		this.listen();
		this.render();
	},
	changeTitle: function() {
		console.log(this.database);
		$("h1").text("Show tables of database " + this.database.database_name);
	},
	listen: function() {
		// it will listen for an event in case we used a Sync / event based call
		var self = this;
		App.io.on("ssh:execute:data:" + self.server, function(data) {
			self.$el.html(self.dataTemplate({stdout: data.stdout}));
		})
	},
	render: function() {
		var self = this;
		this.$el.html(this.template());

		// create a new model
		var model = new App.Models.Database({id: this.id});

		model.fetch({
			success: function(model, response) {
				var database = model.toJSON();
				self.database = database.database;
				self.changeTitle();
			}, 
			error: function() {

			}
		});

		// call testConnection and pass the id
		// the model will make a post request passing the id in the body
		model.showTables(this.id);

		// the model will fire a success or error event on completion
		model.on("showTables:success", function(data) {
			// once we have the response we can display the data of stdout
			// if we made a Sync operation, we use the method listen
			self.$el.html(self.dataTemplate({stdout: data.stdout}));
			new App.Views.Message({
				type: "success", 
				message: "The tables on the database are:"
			});
		})

		model.on("showTables:error", function() {
			console.log("error");
		})
	}
});

App.Views.ShowDatabases = Backbone.View.extend({
	server: null,
	template: _.template($("#genericResponse").html()),
	dataTemplate: _.template($("#genericData").html()),
	initialize: function(data) {
		this.server = data.id;
		this.listen();
		this.render();
		this.changeTitle();
	},
	changeTitle: function() {
		$("h1").text("Show databases on server");
	},
	listen: function() {
		// it will listen for an event in case we used a Sync / event based call
		var self = this;
		App.io.on("ssh:execute:data:" + self.server, function(data) {
			self.$el.html(self.dataTemplate({stdout: data.stdout}));
		})
	},
	render: function() {
		var self = this;
		this.$el.html(this.template());

		// create a new model
		var model = new App.Models.Database();

		// call testConnection and pass the id
		// the model will make a post request passing the id in the body
		model.showDatabases(this.server);

		// the model will fire a success or error event on completion
		model.on("showDatabases:success", function(data) {
			// once we have the response we can display the data of stdout
			// if we made a Sync operation, we use the method listen
			self.$el.html(self.dataTemplate({stdout: data.stdout}));
			new App.Views.Message({
				type: "success", 
				message: "The databases on server are:"
			});
		})

		model.on("showDatabases:error", function() {
			console.log("error");
		})
	}
});


App.Views.LockDatabase = Backbone.View.extend({
	id: null,
	initialize: function(data) {
		this.id = data.id;
		this.render();
	},
	changeStatus: function() {
		var self = this;
		$("td.database-status-" + self.id).text("true");
	},
	render: function() {
		var self = this;
		var model = new App.Models.Database({id: this.id});

		model.lockDatabase(this.id);

		// the model will fire a success or error event on completion
		model.on("lockDatabase:success", function(data) {
			// once we have the response we can display the data of stdout
			// if we made a Sync operation, we use the method listen
			new App.Views.Message({
				type: "success", 
				message: "The database is now locked"
			});

			this.changeStatus();
		})

		model.on("lockDatabase:error", function() {
			console.log("error");
		})
	}
});

App.Views.UnlockDatabase = Backbone.View.extend({
	id: null,
	initialize: function(data) {
		this.id = data.id;
		this.render();
	},
	changeStatus: function() {
		var self = this;
		$("td.database-status-" + self.id).text("false");
	},
	render: function() {
		var self = this;
		var model = new App.Models.Database({id: this.id});

		model.unlockDatabase(this.id);

		// the model will fire a success or error event on completion
		model.on("unlockDatabase:success", function(data) {
			// once we have the response we can display the data of stdout
			// if we made a Sync operation, we use the method listen
			new App.Views.Message({
				type: "success", 
				message: "The database is now unlocked, you can make changes to it"
			});

			this.changeStatus();
		})

		model.on("unlockDatabase:error", function() {
			console.log("error");
		})
	}
});