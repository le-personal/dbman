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
	events: {
		"click .addUserToDatabase": "addUserToDatabase"
	},
	menuTemplate: _.template($("#databaseMenu").html()),
	initialize: function(data) {
		var self = this;

		// since we use a different name than collection, we need to map it here
		// or it will not be recognized
		self.collection = data.databasesCollection;
		self.databaseUsersCollection = data.databaseUsersCollection;
		self.render();
	},
	render: function() {
		var self = this;
		this.$el.html(self.menuTemplate({database: self.model.toJSON()}))
	},
	addUserToDatabase: function(e) {
		e.preventDefault();
		var self = this;

		// the databaseUsersCollection is sent from the ViewDatabase view to here,
		// we pass it to the AddDatabaseUser
		new App.Views.AddDatabaseUser({
			model: self.model, 
			collection: self.databaseUsersCollection
		});
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

		// get the databases prepopulated in JSON
		var databases = _.template($("#databases").html());
		self.collection = new App.Collections.Databases(JSON.parse(databases()));
		self.collection.on("add", self.renderOne, this);
		self.render();
	},
	render: function() {
		var self = this;
		self.collection.each(function(database) {
			self.renderOne(database);
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
	tagName: "div",
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
			self.model = model;
		}
		self.database = model.toJSON();

		self.renderMenu();
		self.render();
	},
	renderMenu: function() {
		// Here we render the menu by instantiating App.Views.DatabaseMenu
		// this class needs the databaseUsersCollection, the databasesCollection
		// and the model (the database) we're viewing.
		// The menu will pass to corresponding views data as needed.

		var self = this;
		// set the users to use it to set the collection of database users and send it to the
		// DatabaseMenu view, the databaseUsersCollection will be sent to the ListUsers and AddUsers views
		var users = self.model.toJSON().users;
		self.databaseUsersCollection = new App.Collections.DatabaseUsers(users);
		
		new App.Views.DatabaseMenu({
			model: self.model, 
			databasesCollection: self.collection, 
			databaseUsersCollection: self.databaseUsersCollection 
		}).render();
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

		// this view will handle showing the users
		new App.Views.ListAllDatabaseUsers({collection: self.databaseUsersCollection, el: "div#databaseUsersContainer"});

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

		self.model.on("showTables:error", function(err) {
			alert.error(err.responseText);
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
 * Show databases on a server,
 * we first get the database in the id and then we get the server
 * to query
 */
App.Views.ShowDatabases = Backbone.View.extend({
	server: null,
	collection: getDatabasesCollection(),
	template: _.template($("#genericResponse").html()),
	dataTemplate: _.template($("#genericData").html()),
	initialize: function(data) {
		var self = this;

		// id is database id
		self.id = data.id;

		self.model = self.collection.get(self.id);
		self.database = self.model.toJSON();
		self.server = self.database.server;

		app.breadcrumb.reset();
		app.breadcrumb.add("Databases", "/databases");
		app.breadcrumb.add(self.database.database_name, "#view/"+self.database._id);
		app.breadcrumb.add("Show databases in server ");
		app.breadcrumb.render();

		app.title.set("Show databases in server  " + self.server.name);

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

		// call testConnection and pass the id
		// the model will make a post request passing the id in the body
		self.model.showDatabases(self.server._id);

		// the model will fire a success or error event on completion
		self.model.on("showDatabases:success", function(data) {

			// once we have the response we can display the data of stdout
			// if we made a Sync operation, we use the method listen
			self.$el.html(self.dataTemplate({stdout: data.stdout, stderr: data.stderr}));
			alert.success("The databases on server are:");
		})

		self.model.on("showDatabases:error", function(err) {
			alert.error(err.responseText);
		})
	}
});

App.Views.ListOneDatabaseUser = Backbone.View.extend({
	tagName: "tr",
	template: _.template($("#databaseUserRow-template").html()),
	events: {
		"click .removeDatabaseUser": "confirmRemoval",
	},
	initialize: function() {
		this.model.on("change", this.render, this);
		this.model.on("destroy", this.remove, this);
	},
	render: function() {
		this.$el.html(this.template({user: this.model.toJSON()}));
		return this;
	},
	remove: function(e) {
		this.$el.remove();
		alert.success("The user was removed from the database");
	},
	confirmRemoval: function(e) {
		e.preventDefault();
		var self = this;
		var databaseUser = self.model.toJSON();
		
		var modal = new Backbone.BootstrapModal({
			title: "Are you sure you want to delete the user " + databaseUser.username,
			content: "This operation cannot be undone, and the user will no longer have access to this database",
			animate: true,
		}).open();

		modal.on("ok", function() {
			self.model.destroy();
		});
	}
});

App.Views.ListAllDatabaseUsers = Backbone.View.extend({
	template: _.template($("#listDatabaseUsers-template").html()),
	initialize: function() {
		var self = this;
		app.loading.show();
		
		self.collection.on("add", self.renderOne, this);
		self.render();
	},
	render: function() {
		var self = this;

		// render the container template, where we define the table
		self.$el.html(self.template());

		self.collection.each(function(user) {
			self.renderOne(user);
		})
	},
	renderOne: function(user) {
		var listOneDatabaseUser = new App.Views.ListOneDatabaseUser({model: user});
		$("tbody#databaseUsers").append(listOneDatabaseUser.render().el);
	}
});

App.Views.AddDatabaseUser = Backbone.View.extend({
	database: {},
	events: {
		'click .submit': "save"
	},
	formTemplate: _.template($("#addDatabaseUser-template").html()),
	initialize: function(data) {
		var self = this;
		self.database = self.model.toJSON();
		self.users = self.collection.toJSON();

		self.render();
	},
	render: function() {
		var self = this;

		var form = self.formTemplate({database: self.database});
		var modal = new Backbone.BootstrapModal({
			title: "Add user to database",
			content: form,
			animate: true
		}).open();

		modal.on("ok", function() {
			self.submit();
		});
	},
	listen: function(id) {
		// id is the new created user id
		var self = this;
		App.io.on("ssh:execute:data:" + id, function(data) {
			self.$el.html(self.dataTemplate({stdout: data.stdout, stderr: data.stderr}));
		})
	},
	submit: function() {
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
				// self.$el.html(self.templateGeneric());
				// self.listen(response._id);
				app.loading.hide();

				// add the model to the collection so it's detected
				// the collection comes from the ViewDatabase View
				self.collection.add(model);
			},
			error: function(model, error) {
				alert.error(error.responseText);
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
				self.$el.html(self.template({database: database, server: database.server}));
				app.loading.hide();
			},
			error: function(model, error) {
				alert.error(error.responseText);
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
				// call the import step
				self.importDatabase(model);
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
			alert.success("Successfully imported the database");
			app.loading.hide();
		})

		db.on("importDatabase:error", function(error) {
			alert.error(error.responseText);
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
 * List one backup 
 */
App.Views.ListOneBackup = Backbone.View.extend({
	tagName: "tr",
	template: _.template($("#listBackupsRow-template").html()),
	render: function() {
		this.$el.html(this.template({backup: this.model.toJSON()}));
		return this;
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
	template: _.template($("#listBackups-template").html()),
	initialize: function(data) {
		app.loading.show();
		var self = this;
		self.databaseId = data.id;

		var db = self.databases.get(self.databaseId);
		db.getDatabase();
		db.on("getDatabase:success", function(model, response) {
			self.database = model.toJSON();
			self.setBreadcrumbAndTitle();

			// Create collection and populate it
			self.collection = new App.Collections.Backups(self.database.backups);

			// render the container template where we define the table
			self.$el.html(self.template());

			// render 
			self.render();
			
			// listener
			self.collection.on("add", self.renderOne, this);
		});

	},
	setBreadcrumbAndTitle: function() {
		var self = this;
		app.title.set("Backups of " + self.database.database_name);

		app.breadcrumb.reset();
		app.breadcrumb.add("Databases", "/databases");
		app.breadcrumb.add(self.database.database_name, "#view/" + self.database._id);
		app.breadcrumb.add("Backups");
		app.breadcrumb.render();
	},
	render: function() {
		var self = this;

		self.collection.each(function(backup) {
			self.renderOne(backup);
		});

		app.loading.hide();
	},
	renderOne: function(backup) {
		var listOneBackup = new App.Views.ListOneBackup({model: backup});
		$("tbody#backupsList").append(listOneBackup.render().el);
	}
});


App.Views.AddPermissionsForm = Backbone.View.extend({
	tagName: "div",
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
		this.$el.empty().html(self.formTemplate());

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
	}
});

App.Views.Permissions = Backbone.View.extend({
	tagName: "div",
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

		// get the model from the collection, not from the server
		// this is enought to set the breadcumb and title and to call render
		self.model = self.collection.get(self.id);

		// save the JSON to self.database
		self.database = self.model.toJSON();

		// set breadcrumb and title
		self.setBreadcrumbAndTitle();

		// render 
		self.render();

		// rebuild the collection and re-render
		self.collection.on("reset", function() {
			console.log("Listened reset");
			self.collection.fetch({
				success: function(model, response) {
					console.log("Got success");
					self.render();
				},
				error: function(model, response) {
					alert.error(response.responseText);
				}
			});
		}, this);
	},
	setBreadcrumbAndTitle: function() {
		var self = this;
		var database = self.database;
		app.title.set("Permissions for database " + database.database_name);

		app.breadcrumb.reset();
		app.breadcrumb.add("Databases", "/databases");
		app.breadcrumb.add(database.database_name, "#view/" + database._id);
		app.breadcrumb.add("Permissions");
		app.breadcrumb.render();
	},
	render: function() {
		var self = this;

		// get the database each time the render is triggered
		// this is because we call render when we reset the collection
		self.model.getDatabase();
		self.model.on("getDatabase:success", function(model, response) {
			// reset the model
			self.model = model;
			self.database = model.toJSON();

			var database = self.database;

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
		});
	},
	openForm: function(e) {
		e.preventDefault();
		var self = this;

		var form = new App.Views.AddPermissionsForm();
		var modal = new Backbone.BootstrapModal({
			content: form
		}).open();

		modal.on("ok", function() {
			var user = $("#selectedUser").val();
			var permission = $("select[name=access]").val();
			var database = self.database;
			var id = database._id;
			
			self.model.addPermission(id, user, permission);

			self.model.on("addPermission:success", function(response) {
				self.collection.reset();
				modal.remove();
			})
		})
	},
	revokeAccess: function(e) {
		e.preventDefault();
		var self = this;

		var user = $(e.currentTarget).attr("id");
		var permission = $(e.currentTarget).attr("data-permission");
		var database = self.database;
		var id = database._id;

		self.model.removePermission(id, user, permission);

		self.model.on("removePermission:success", function(response) {
			self.collection.reset();
		})
	}
});