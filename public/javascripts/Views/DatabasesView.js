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

			self.changeStatus();
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

			self.changeStatus();
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

App.Views.ShowBackups = Backbone.View.extend({

});

App.Views.Backup = Backbone.View.extend({
	id: null,
	initialize: function(data) {
		this.id = data.id;
		this.render();
	},
	render: function() {

	}
});

App.Views.Import = Backbone.View.extend({
	id: null,
	fileId: null,
	database: {},
	template: _.template($("#importDatabase-template").html()),
	templateGeneric: _.template($("#genericResponse").html()),
	dataTemplate: _.template($("#genericData").html()),
	loaded: 0,
	events: {
		"change .fileinput-button": "upload",
		"click .submit": "save"
	},
	initialize: function(data) {
		this.bind("importDatabase", this.importDatabase);
		this.id = data.id;
		this.render();
	},
	render: function() {
		// show form
		var self = this;

		var model = new App.Models.Database({id: self.id});
		model.fetch({
			success: function(model, response) {
				var database = model.toJSON();
				self.database = database.database;
				self.changeTitle();
				self.$el.html(self.template({database: database.database, server: database.server}));
			},
			error: function(model, response) {
				new App.Views.Message({
					type: "danger",
					message: response.responseText
				});
			}
		});
	},
	showProgress: function() {
		$("#progress").removeClass("hidden");
	},
	hideProgress: function() {
		$("#progress").addClass("hidden");
	},
	showSubmitButton: function() {
		$(".submit").removeClass("hidden");
	},
	updateProgressBar: function(percentage) {
		var bar = $("#progress .bar");
		bar.css('width', percentage + '%').attr("aria-valuenow", percentage);
	},
	changeTitle: function() {
		$("h1").text("Import a database into " + this.database.database_name);
	},
	upload: function(e) {
		e.preventDefault();

		var self = this;
		self.showProgress();

  	var formData = new FormData();
    var file = document.getElementById('file').files[0];
    formData.append('file', file);

    var xhr = new XMLHttpRequest();
    
    xhr.upload.onprogress = function(e) {
      if (e.lengthComputable) {
        var percentage = (e.loaded / e.total) * 100;
        self.updateProgressBar(percentage);
      }
    };
    
    xhr.onerror = function(e) {
    	new App.Views.Message({type: "danger", message: e.responseText});
      self.hideProgress();
    };
    
    xhr.onload = function() {
    	self.updateProgressBar(100);
      self.hideProgress();
      
      var newfile = JSON.parse(this.responseText);
      $("div.newfile").text("File uploaded: " + newfile.filename);
      new App.Views.Message({type: "success", message: "File uploaded"});
      $("span.fileinput-button").hide();
      $("input#fileid").val(newfile._id);
      self.fileId = newfile._id;

      self.showSubmitButton();
    };
    
    xhr.open('post', '/api/files', true);
    xhr.send(formData);
	},
	save: function(e) {
		e.preventDefault();
		var self = this;

		var fileId = self.fileId;
		var file = new App.Models.File({id: fileId});
		file.fetch({
			success: function(model, response) {
				// trigger the import step
				self.trigger("importDatabase", model);
			},
			error: function(model, response) {

			}
		});
	},
	importDatabase: function(model) {
		var self = this;

		var file = model.toJSON();
	
		var data = {
			database: self.id,
			file: file._id
		}

		var db = new App.Models.Database();

		// start listening and start empty
		self.renderGenericTemplate({stdout: false, stderr: false});
		self.listen();

		db.importDatabase(data.database, data.file);

		db.on("importDatabase:success", function(response) {
			new App.Views.Message({
				type: "success",
				message: "Successfully imported the database"
			});
		})

		db.on("importDatabase:error", function(error) {
			new App.Views.Message({
				type: "danger",
				message: error.responseText
			});
		})
	},
	renderGenericTemplate: function(data) {
		var self = this;
		self.$el.html(self.dataTemplate({stdout: data.stdout, stderr: data.stderr}));
	},
	listen: function() {
		var self = this;
		App.io.on("ssh:execute:data:" + self.fileId, function(data) {
			self.$el.html(self.dataTemplate({stdout: data.stdout, stderr: data.stderr}));
		})
	}
});

App.Views.CreateBackup = Backbone.View.extend({
	databaseId: null,
	database: {},
	template: _.template($("#createBackup-template").html()),
	downloadLinkTemplate: _.template($("#downloadLink-template").html()),
	events: {
		"click .submit": "save"
	},
	initialize: function(data) {
		var self = this;
		this.databaseId = data.id;

		var database = new App.Models.Database({id: this.databaseId});
		database.fetch({
			success: function(model, response) {
				self.database = response.database;
				self.render();
			},
			error: function(model, error) {

			}
		});
	},
	changeTitle: function() {
		$("h1").text("Create backup of database " + this.database.database_name);
	},
	render: function() {
		var self = this;
		self.$el.html(self.template({database: self.database}));
		self.changeTitle();
	},
	save: function(e) {
		var self = this;
		e.preventDefault();
		// gather all values of the form
		var values = {}
		var form = $("form").serializeArray();
		_.each(form, function(element) {
			values[element.name] = element.value;
		});

		if(!values.name || !values.format) {
			new App.Views.Message({
				type: "danger",
				message: "Both the name and the format are required"
			})				
		}
		else {
			var model = new App.Models.Backup();
			model.save(values, {
				success: function(model, response) {
					new App.Views.Message({
						type: "success",
						message: "Backup created and registered. You can download it now or you can list the backups to download it."
					})

					// show download link here
					self.$el.html(self.downloadLinkTemplate({backup: response}));

					// remove form from the dom
					$("form").remove();
				},
				error: function(model, error) {
					new App.Views.Message({
						type: "danger",
						message: error.responseText
					})				
				}
			});
		}
	}
});

App.Views.ListBackups = Backbone.View.extend({
	databaseId: null,
	database: {},
	backups: {},
	collection: new App.Collections.Backups(),
	template: _.template($("#listBackups-template").html()),
	rowTemplate: _.template($("#listBackupsRow-template").html()),
	initialize: function(data) {
		var self = this;
		self.databaseId = data.id;

		var db = new App.Models.Database({id: self.databaseId});
		db.fetch({
			success: function(model, response) {
				self.database = response.database;
				self.backups = response.backups;

				self.render();

				console.log("collection");
				console.log(self.collection);
				_.each(response.backups, function(backup) {
					self.collection.add(backup);
				})
			},
			error: function(model, error) {
				new App.Views.Message({type: "danger", message: error.responseText});
			}
		});

		self.collection.on("add", self.renderRow, this);
	},	
	render: function() {
		var self = this;
		self.$el.html(self.template({database: self.database, backups: self.backups}))
	},
	renderRow: function(model) {
		var self = this;
		var backup = model.toJSON();
		$("tbody").prepend(self.rowTemplate({backup: backup}))
	}
});