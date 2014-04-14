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
				console.log(data.users);
				self.$el.html(self.template({server: data.server, database: data.database, users: data.users}));
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
			error: function(model, response) {
				new App.Views.Message({
					type: "danger",
					message: response.responseText
				});
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
			self.$el.html(self.dataTemplate({stdout: data.stdout, stderr: data.stderr}));
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
			self.$el.html(self.dataTemplate({stdout: data.stdout, stderr: data.stderr}));
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
			self.$el.html(self.dataTemplate({stdout: data.stdout, stderr: data.stderr}));
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
			self.$el.html(self.dataTemplate({stdout: data.stdout, stderr: data.stderr}));
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

App.Views.ShowUsersInDatabase = Backbone.View.extend({
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
		$("h1").text("Show users in database " + this.database.database_name);
	},
	listen: function() {
		// it will listen for an event in case we used a Sync / event based call
		var self = this;
		App.io.on("ssh:execute:data:" + self.server, function(data) {
			self.$el.html(self.dataTemplate({stdout: data.stdout, stderr: data.stderr}));
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
		model.showUsersInDatabase(this.id);

		// the model will fire a success or error event on completion
		model.on("showUsersInDatabase:success", function(data) {
			// once we have the response we can display the data of stdout
			// if we made a Sync operation, we use the method listen
			self.$el.html(self.dataTemplate({stdout: data.stdout, stderr: data.stderr}));
			new App.Views.Message({
				type: "success", 
				message: "The users with access to this database are:"
			});
		})

		model.on("showUsersInDatabase:error", function() {
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

App.Views.ListAllUsers = Backbone.View.extend({
	collection: new App.Collections.DatabaseUsers(),
	template: _.template($("#listDatabaseUsers-template").html()),
	row: _.template($("#databaseUserRow-template").html()),
	initialize: function() {
		this.collection.fetch();
		this.render();

		this.collection.on("add", "addUser", this);
	},
	render: function() {
		this.$el.html(this.template());
	},
	addUser: function(user) {
		console.log(user);
		var self = this;
		$("tbody").append(self.row({user: user}))
	}
});

App.Views.ViewDatabaseUser = Backbone.View.extend({

});

App.Views.AddDatabaseUser = Backbone.View.extend({
	databaseId: null,
	database: {},
	events: {
		'click .submit': "save"
	},
	template: _.template($("#addDatabaseUser-template").html()),
	templateGeneric: _.template($("#genericResponse").html()),
	dataTemplate: _.template($("#genericData").html()),
	initialize: function(data) {
		this.databaseId = data.id;
		this.render();
	},
	changeTitle: function(database_name) {
		$("h1").text("Create user on database " + database_name);
	},
	render: function() {
		var self = this;

		var database = new App.Models.Database({id: self.databaseId});
		database.fetch({
			success: function(model, response) {
				var data = model.toJSON();
				self.database = data.database;
				self.$el.html(self.template({database: data.database, databaseId: self.databaseId}));
				self.changeTitle(data.database.database_name);
			}
		});
	},
	listen: function(id) {
		// id is the new created user id
		var self = this;
		App.io.on("ssh:execute:data:" + id, function(data) {
			self.$el.html(self.dataTemplate({stdout: data.stdout, stderr: data.stderr}));
		})
	},
	save: function(e) {
		e.preventDefault();
		var self = this;

		var values = {
			allowedHosts: []
		}
		var formValues = $("form").serializeArray();
		_.each(formValues, function(element) {
			values[element.name] = element.value;
		})

		_.each(values.allowedhosts.split(","), function(host) {
			values.allowedHosts.push(host);
		})

		var model = new App.Models.DatabaseUser();
		model.save(values, {
			success: function(model, response) {
				self.$el.html(self.templateGeneric());
				self.listen(response._id);
			},
			error: function(model, response) {
				new App.Views.Message({type: "danger", message: response.responseText});
			}
		})
	}
});

App.Views.DropUser = Backbone.View.extend({
	id: null,
	initialize: function(data) {
		this.id = data.id;
		this.render();
	},
	render: function() {
		var self = this;
		var model = new App.Models.DatabaseUser({id: this.id});

		model.destroy({
			success: function() {
				$(".database-user-" + self.id).hide().remove();
				new App.Views.Message({
					type: "success",
					message: "Removed the database user"
				});
			},
			error: function(model, response) {
				new App.Views.Message({
					type: "danger",
					message: response.responseText
				});
			}
		});
	}
});
