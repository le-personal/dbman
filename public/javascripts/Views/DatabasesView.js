var dbMenu = new App.Menu();

function getDatabasesCollection() {
	// Get te databases prepopulated in a template that prints JSON
	var databases = _.template($("#databases").html());
	// define a new application with the data loaded
	var collection = new App.Collections.Databases(JSON.parse(databases()));

	return collection;
}


/**
 * SHows the actions menu for the databases
 */
App.Views.DatabaseMenu = Backbone.View.extend({
	el: "#actions",
	menuTemplate: _.template($("#databaseMenu").html()),
	render: function(database) {
		var self = this;
		this.$el.html(self.menuTemplate({database: database}))
	}
});

/**
 * List one database row in the table
 */
App.Views.ListDatabasesRow = Backbone.View.extend({
	tagName: "tr",
	template: _.template($("#databaseRow").html()),
	events: {
		"click .lockDatabase": "lock",
		"click .unlockDatabase": "unlock",
		"click .removeDatabase": "confirmRemoval",
		"click .viewDatabase": "viewDatabase"
	},
	initialize: function() {
		this.model.on("change", this.render, this);
		this.model.on("destroy", this.remove, this);
	},
	render: function() {
		this.$el.html(this.template({database: this.model.toJSON()}));
		return this;
	},
	viewDatabase: function(e) {
		e.preventDefault();
		var self = this;

		new App.Views.ViewDatabase({model: self.model, el: "div#content", id: self.model.toJSON()._id});
	},
	lock: function(e) {
		e.preventDefault();
		var self = this;
		var id = self.model.toJSON()._id;

		self.model.lockDatabase(id);

		// the model will fire a success or error event on completion
		self.model.on("lockDatabase:success", function(data) {
			self.model.set({isLocked: true});
		})

		self.model.on("lockDatabase:error", function(error) {
			alert.error(error.responseText);
		});
	},
	unlock: function(e) {
		e.preventDefault();
		var self = this;
		var id = self.model.toJSON()._id;

		self.model.unlockDatabase(id);

		// the model will fire a success or error event on completion
		self.model.on("unlockDatabase:success", function(data) {
			self.model.set({isLocked: false});
		})

		self.model.on("unlockDatabase:error", function(error) {
			alert.error(error.responseText);
		});
	},
	remove: function(e) {
		// remove from dom
		this.$el.remove();
		alert.show("success", "The database was removed from the server");
	},
	confirmRemoval: function(e) {
		/**
		 * Confirms the removal of a database by showing a modal
		 */
		e.preventDefault();
		var self = this;
		var database = self.model.toJSON();

		if(database.isLocked) {
			return alert.error("The database is locked, you cannot delete it");
		}
		else {
			var modal = new Backbone.BootstrapModal({
				title: "Are you sure you want to delete the database " + database.database_name,
				content: "This operation cannot be undone, and the database will be removed from the server too",
				animate: true,
			}).open();

			modal.on("ok", function() {
				self.model.destroy();
			});
		}
	} 
});

/**
 * List all databases
 */
App.Views.ListDatabases = Backbone.View.extend({
	collection: null,
	events: {
		"click .addDatabase": "addDatabase"
	},
	initialize: function() {
		var self = this;

		app.loading.hide();

		// hide the breadcrumb
		app.breadcrumb.hide();
		
		// set the menu
		dbMenu.mainmenu("databases");

		var databases = _.template($("#databases").html());
		self.collection = new App.Collections.Databases(JSON.parse(databases()));
		self.collection.on("add", self.renderOne, this);
		self.render();
	},
	render: function() {
		var self = this;
		self.collection.each(function(database) {
			var databaseRowView = new App.Views.ListDatabasesRow({model: database});
			$("tbody#listDatabases").append(databaseRowView.render().el);
		}, this);
	},
	renderOne: function(database) {
		var databaseRowView = new App.Views.ListDatabasesRow({model: database});
		$("tbody#listDatabases").append(databaseRowView.render().el);
	},
	addDatabase: function(e) {
		e.preventDefault();
		var self = this;
		new App.Views.AddDatabase({collection: self.collection});
	}
});

/**
 * Create a database
 */
App.Views.AddDatabase = Backbone.View.extend({
	template: _.template($("#addDatabaseTemplate").html()),
	servers: new App.Collections.Servers(),
	initialize: function() {
		var self = this;
		
		self.servers.fetch({
			success: function(models, response) {
				self.render();
			},
			error: function(models, error) {
				alert.error(error.responseText);
			}
		});
	},
	render: function() {
		var self = this;
		var servers = self.servers.toJSON();

		var form = self.template({servers: servers});
		var modal = new Backbone.BootstrapModal({
			title: "Add a database",
			content: form
		}).open();

		modal.on("ok", function() {
			self.submit();
		});
	},
	submit: function() {
		app.loading.show();

		var self = this;
		var data = {}
		var formValues = $("form").serializeArray();
		_.each(formValues, function(element) {
			data[element.name] = element.value;
		});

		var model = new App.Models.Database();
		model.save(data, {
			success: function(m, response) {
				app.loading.hide();
				self.collection.add(m);
			},
			error: function(m, error) {
				alert.error(error.responseText);
			}
		});
	}
});

/**
 * View a database
 */
App.Views.ViewDatabase = Backbone.View.extend({
	id: null,
	collection: getDatabasesCollection(),
	template: _.template($("#viewDatabaseTemplate").html()),
	database: {},
	initialize: function(data) {
		app.loading.show();

		var self = this;
		self.id = data.id;
		
		if(self.model) {
			var model = self.model;
		}
		else {
			var model = this.collection.get(this.id);
		}
		self.database = model.toJSON();

		self.renderMenu();
		self.render();
	},
	renderMenu: function() {
		var self = this;
		new App.Views.DatabaseMenu().render(self.database);
	},
	render: function() {
		var self = this;
		var database = self.database;

		// Set the title
		app.title.set("Database " + database.database_name);

		// Set the breadcrumb
		app.breadcrumb.reset();
		app.breadcrumb.add("Databases", "/databases");
		app.breadcrumb.add(database.database_name, "#view/" + database._id);
		app.breadcrumb.add("view");
		app.breadcrumb.render();

		// render the template
		self.$el.html(self.template({
			server: database.server, 
			database: database, 
			users: database.users, 
			permissions: database.permissions
		}));

		// Hide
		app.loading.hide();
	}
});




/**
 * Show tables in a database
 */
App.Views.ShowTables = Backbone.View.extend({
	id: null,
	collection: getDatabasesCollection(),
	model: null,
	database: {},
	template: _.template($("#genericResponse").html()),
	dataTemplate: _.template($("#genericData").html()),
	initialize: function(data) {
		var self = this;

		self.id = data.id;
		self.model = self.collection.get(self.id);
		self.database = self.model.toJSON();

		app.title.set("Tables in database " + self.database.database_name);

		app.breadcrumb.reset();
		app.breadcrumb.add("Databases", "/databases");
		app.breadcrumb.add(self.database.database_name, "#view/" + self.database._id);
		app.breadcrumb.add("Show Tables");
		app.breadcrumb.render();

		self.listen();
		self.render();
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
		app.loading.show();
		self.$el.html(self.template());

		self.model.getDatabase();
		self.model.on("getDatabase:success", function(model, response) {
			self.database = model.toJSON();
			
			// call testConnection and pass the id
			// the model will make a post request passing the id in the body
			self.model.showTables(self.id);
		})

		// the model will fire a success or error event on completion
		self.model.on("showTables:success", function(data) {
			// once we have the response we can display the data of stdout
			// if we made a Sync operation, we use the method listen
			self.$el.html(self.dataTemplate({stdout: data.stdout, stderr: data.stderr}));
			alert.show("success", "The tables on the database " + self.database.database_name + " are");
		})

		self.model.on("showTables:error", function() {
			alert.error("There was an error");
		})
	}
});

/**
 * SHow users in a database
 */
App.Views.ShowUsersInDatabase = Backbone.View.extend({
	id: null,
	database: {},
	model: null,
	collection: getDatabasesCollection(),
	template: _.template($("#genericResponse").html()),
	dataTemplate: _.template($("#genericData").html()),
	initialize: function(data) {
		app.loading.show();

		var self = this;
		self.id = data.id;

		self.model = self.collection.get(self.id);
		self.database = self.model.toJSON();

		app.breadcrumb.reset();
		app.breadcrumb.add("Databases", "/databases");
		app.breadcrumb.add(self.database.database_name, "#view/"+self.database._id);
		app.breadcrumb.add("Users with access to database");
		app.breadcrumb.render();

		app.title.set("Users with access to database " + self.database.database_name);

		this.listen();
		this.render();
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
		self.model.getDatabase();
		self.model.on("getDatabase:success", function(model, response) {		
			// // call showUsersInDatabase and pass the id
			// // the model will make a post request passing the id in the body
			self.model.showUsersInDatabase(self.id);
		});		

		// the model will fire a success or error event on completion
		self.model.on("showUsersInDatabase:success", function(data) {
			// once we have the response we can display the data of stdout
			// if we made a Sync operation, we use the method listen
			self.$el.html(self.dataTemplate({stdout: data.stdout, stderr: data.stderr}));
			alert.show("success", "The users with access to this database are");
		});
	}
});


/**
 * Needs work
 */
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


App.Views.LockDatabase = Backbone.View.extend({
	id: null,
	collection: getDatabasesCollection(),
	initialize: function(data) {
		var self = this;
		self.id = data.id;
		self.render();
	},
	changeStatus: function() {
		var self = this;
		$("td.database-status-" + self.id).text("true");
	},
	render: function() {
		var self = this;
		var model = self.collection.get(self.id);

		model.lockDatabase(this.id);

		// the model will fire a success or error event on completion
		model.on("lockDatabase:success", function(data) {
			// once we have the response we can display the data of stdout
			// if we made a Sync operation, we use the method listen
			alert.show("success", "The database is now locked");
			// self.changeStatus();
		})

		model.on("lockDatabase:error", function(error) {
			alert.error(error.responseText);
		});
	}
});

/**
 * Unlock database
 */
App.Views.UnlockDatabase = Backbone.View.extend({
	id: null,
	collection: getDatabasesCollection(),
	initialize: function(data) {
		var self = this;
		self.id = data.id;
		self.render();
	},
	changeStatus: function() {
		var self = this;
		$("td.database-status-" + self.id).text("false");
	},
	render: function() {
		var self = this;
		var model = self.collection.get(self.id);

		model.unlockDatabase(this.id);

		// the model will fire a success or error event on completion
		model.on("unlockDatabase:success", function(data) {
			// once we have the response we can display the data of stdout
			// if we made a Sync operation, we use the method listen
			alert.show("success", "The database is now unlocked, you can make changes to it");

			self.changeStatus();
		})

		model.on("unlockDatabase:error", function(error) {
			console.log(error.responseText);
		})
	}
});

App.Views.ListAllUsers = Backbone.View.extend({
	collection: new App.Collections.DatabaseUsers(),
	template: _.template($("#listDatabaseUsers-template").html()),
	row: _.template($("#databaseUserRow-template").html()),
	initialize: function() {
		app.loading.show();
		this.collection.fetch();
		this.render();

		this.collection.on("add", "addUser", this);
	},
	render: function() {
		this.$el.html(this.template());
		app.loading.show();
	},
	addUser: function(user) {
		console.log(user);
		var self = this;
		$("tbody").append(self.row({user: user}))
	}
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
		app.loading.show();
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
				app.loading.hide();
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
		app.loading.show();
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
				app.loading.hide();
			},
			error: function(model, response) {
				new App.Views.Message({type: "danger", message: response.responseText});
				app.loading.hide();
			}
		})
	}
});

App.Views.DropUser = Backbone.View.extend({
	id: null,
	initialize: function(data) {
		app.loading.show();
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
				app.loading.hide();
			},
			error: function(model, response) {
				new App.Views.Message({
					type: "danger",
					message: response.responseText
				});
				app.loading.hide();
			}
		});
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
		app.loading.show();
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
				self.database = database;
				self.changeTitle();
				self.$el.html(self.template({database: database, server: database.server}));
				app.loading.hide();
			},
			error: function(model, response) {
				new App.Views.Message({
					type: "danger",
					message: response.responseText
				});
				app.loading.hide();
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
		app.loading.show();
		var self = this;

		var fileId = self.fileId;
		var file = new App.Models.File({id: fileId});
		file.fetch({
			success: function(model, response) {
				// trigger the import step
				self.trigger("importDatabase", model);
				app.loading.hide();
			},
			error: function(model, response) {
				app.loading.hide();
			}	
		});
	},
	importDatabase: function(model) {
		app.loading.show();
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
			app.loading.hide();
		})

		db.on("importDatabase:error", function(error) {
			new App.Views.Message({
				type: "danger",
				message: error.responseText
			});
			app.loading.hide();
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


/**
 * Create a backup
 * Shows a modal at the end with the download button
 */
App.Views.CreateBackup = Backbone.View.extend({
	databaseId: null,
	collection: getDatabasesCollection(),
	model: null,
	database: {},
	template: _.template($("#createBackup-template").html()),
	downloadLinkTemplate: _.template($("#downloadLink-template").html()),
	events: {
		"click .submit": "save"
	},
	initialize: function(data) {
		app.loading.show();
		var self = this;
		self.databaseId = data.id;


		self.model = self.collection.get(self.databaseId);
		self.database = self.model.toJSON();

		app.title.set("Create backup of database " + self.database.database_name);
	
		app.breadcrumb.reset();
		app.breadcrumb.add("Databases", "/databases");
		app.breadcrumb.add(self.database.database_name, "#view/" + self.database._id);
		app.breadcrumb.add("Create backup");
		app.breadcrumb.render();

		self.model.getDatabase();
		self.model.on("getDatabase:success", function(model, response) {
			self.database = response;
			self.render();
		});
	},
	render: function() {
		var self = this;
		self.$el.html(self.template({database: self.database}));
		
		app.loading.hide();
	},
	save: function(e) {
		app.loading.show();

		var self = this;
		e.preventDefault();

		// gather all values of the form
		var values = {}
		var form = $("form").serializeArray();
		_.each(form, function(element) {
			values[element.name] = element.value;
		});

		if(!values.name || !values.format) {
			alert.error("Both the name and the format are required");
		}
		else {
			var model = new App.Models.Backup();
			model.save(values, {
				success: function(model, response) {
					alert.show("success", "Backup created and registered. You can download it now or you can list the backups to download it.");
					
					// show download link here
					var content = self.downloadLinkTemplate({backup: response});

					// open a modal with the button
					var modal = new Backbone.BootstrapModal({
						title: "Backup ready!",
						content: content,
						allowCancel: false,
						animate: true,
					}).open();

					// remove form from the dom
					$("form").remove();
				},
				error: function(model, error) {
					alert.error(error.responseText);
				}
			});
		}
	}
});


/**
 * List all backups for a database
 */
App.Views.ListBackups = Backbone.View.extend({
	databaseId: null,
	database: {},
	backups: {},
	databases: getDatabasesCollection(),
	collection: new App.Collections.Backups(),
	template: _.template($("#listBackups-template").html()),
	rowTemplate: _.template($("#listBackupsRow-template").html()),
	initialize: function(data) {
		app.loading.show();
		var self = this;
		self.databaseId = data.id;

		var db = self.databases.get(self.databaseId);
		db.getDatabase();
		db.on("getDatabase:success", function(model, response) {
			self.database = response;

			app.title.set("Backups of " + self.database.database_name);

			app.breadcrumb.reset();
			app.breadcrumb.add("Databases", "/databases");
			app.breadcrumb.add(self.database.database_name, "#view/" + self.database._id);
			app.breadcrumb.add("Backups");
			app.breadcrumb.render();
			
			self.backups = response.backups;
			self.render();

			self.collection.reset();
			_.each(response.backups, function(backup) {
				self.collection.add(backup);
			})
		});

		self.collection.on("add", self.renderRow, this);
	},	
	render: function() {
		var self = this;
		self.$el.html(self.template({database: self.database, backups: self.backups}))
		app.loading.hide();
	},
	renderRow: function(model) {
		var self = this;
		var backup = model.toJSON();
		$("tbody").prepend(self.rowTemplate({backup: backup}))
	}
});


App.Views.AddPermissionsForm = Backbone.View.extend({
	formTemplate: _.template($("#permissionsForm").html()),
	initialize: function() {
		var self = this;
		app.loading.show();
		this.bind("ok", this.okClicked);

		this.users = new App.Collections.Users();
		this.users.fetch({
			success: function(models, results) {
				return self.render();
			},
			error: function(models, error) {

			}
		});
	},
	render: function() {
		var self = this;
		app.loading.hide();
		this.$el.html(self.formTemplate());

		var users = this.users;
		var userNames = users.pluck("fullName");

		$("input#user").autocomplete({
			source: userNames,
			select: function(event, ui) {
				var selectedModel = users.where({fullName: ui.item.value})[0];
				var user = selectedModel.toJSON();

				// set the user._id in a hidden input
				$("#selectedUser").val(user._id);
			} 
		});
	},
	okClicked: function() {

	}
});

App.Views.Permissions = Backbone.View.extend({
	id: null,
	collection: getDatabasesCollection(),
	database: null,
	permissionRow: _.template($("#permissionRow").html()),
	template: _.template($("#permissionsTemplate").html()),
	events: {
		"click a.allowAccess": "openForm",
		"click a.revoke-access-btn": "revokeAccess"
	},
	initialize: function(data) {
		var self = this;
		self.id = data.id;
		app.loading.show();

		self.collection.on("reset", function() {
			self.collection.fetch({
				success: function() {
					self.render();
				},
				error: function(model, response) {
					// self.render();
					alert("ERROR");
				}
			});
		}, this);

		this.render();
	},
	render: function() {
		var self = this;

		this.database = this.collection.get(self.id);
		var database = self.database.toJSON();

		// Set the title and breadcrumb
		new App.Title().set("Permissions for database: " + database.database_name);

		// Set the breadcrumb
		new App.Breadcrumb().add([
			{link: "/databases", title: "Databases"},
			{link: "#view/" + database._id, title: database.database_name},
			{link: "#permissions/" + database._id, title: "Permissions"}
		]);
		
		// add the main content
		self.$el.html(self.template({database: database}));

		var permissions = database.permissions;
		
		// for each permission add the right template with the right data
		_.each(database.permissions.view, function(viewAccess) {
			var data = viewAccess;
			data.permission = "view";
			$("#membersWithViewAccess").append(self.permissionRow(data));
		});

		_.each(database.permissions.edit, function(editAccess) {
			var data = editAccess;
			data.permission = "edit";
			$("#membersWithEditAccess").append(self.permissionRow(data));
		});

		_.each(database.permissions.import, function(importAccess) {
			var data = importAccess;
			data.permission = "import";
			$("#membersWithImportAccess").append(self.permissionRow(data));
		});

		_.each(database.permissions.remove, function(removeAccess) {
			var data = removeAccess;
			data.permission = "remove";
			$("#membersWithRemoveAccess").append(self.permissionRow(data));
		});

		app.loading.hide();
	},
	openForm: function(e) {
		e.preventDefault();
		var self = this;

		var content = new App.Views.AddPermissionsForm();
		var modal = new Backbone.BootstrapModal({
			content: content
		}).open();

		modal.on("ok", function() {
			var user = $("#selectedUser").val();
			var permission = $("select[name=access]").val();
			var database = self.database.toJSON();
			var id = database._id;
			
			self.database.addPermission(id, user, permission);

			self.database.on("addPermission:success", function(response) {
				self.collection.reset();
			})
		})
	},
	revokeAccess: function(e) {
		e.preventDefault();
		var self = this;

		var user = $(e.currentTarget).attr("id");
		var permission = $(e.currentTarget).attr("data-permission");
		var database = self.database.toJSON();
		var id = database._id;

		self.database.removePermission(id, user, permission);

		self.database.on("removePermission:success", function(response) {
			self.collection.reset();
		})
	}
});