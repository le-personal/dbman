define(function(require) {

	var _ = require("underscore");
	var $ = require("jquery");
	var Backbone = require("backbone");
	var Marionette = require("marionette");
	var BootstrapModal = require("backboneBootstrapModal");

	var io = require("/js/lib/io.js");
  var loading = require("/js/lib/loading.js");

  // collections
  var DatabasesCollection = require("/js/databases/collections/databases.js");
  var ServersCollection = require("/js/servers/collections/collection.js");
  var BackupsCollection = require("/js/databases/collections/backups.js");
  var DatabaseUsersCollection = require("/js/databases/collections/databasesusers.js");
  
  // models
  var Database = require("/js/databases/models/database.js");

  var layout = require("/js/common/views/layout.js");
  var Title = require("/js/common/views/title.js");
  var DataView = require("/js/common/views/data.js");
  var MenuView = require("/js/common/views/menu.js");
  var MenuDatabaseView = require("/js/databases/views/menu.js");

	var ViewDatabases = require("/js/databases/views/viewDatabases.js");
	var ViewDatabase = require("/js/databases/views/viewDatabase.js");
	var AddDatabaseFormView = require("/js/databases/views/addDatabaseFormView.js");
	var AddUserToDatabaseForm = require("/js/databases/views/addUserToDatabaseForm.js");
	var ViewBackups = require("/js/databases/views/viewBackups.js");
	var ViewUsers = require("/js/databases/views/viewUsers.js");
	var CreateBackupFormView = require("/js/databases/views/createBackupFormView.js");
	var DownloadBackupLinkView = require("/js/databases/views/downloadBackupLinkView.js");
  var ImportView = require("/js/databases/views/importView.js");

	var Controller = Backbone.Marionette.Controller.extend({
		// application events we should be listenting to here
		listenTo: {
			'viewDatabase': 'viewDatabase',
			'showAddDatabaseForm': 'showAddDatabaseForm',
			"onClick:menu:add": "showAddDatabaseForm",
			"onClick:menu:adduser": "showAddUserToDatabaseForm",
			"onClick:menu:createbackup": "showCreateBackupForm",
			"lockDatabase": "lockDatabase",
			"unlockDatabase": "unlockDatabase",
			"removeDatabase": "openModalToConfirmRemovalOfDatabase",
			"showTables": "showTables",
			"showUsersInDatabase": "showUsersInDatabase",
			"viewBackups": "viewBackups",
			"showNewBackupCreatedModal": "showNewBackupCreatedModal",
			"import": "showImportModal",
      "importFileUploadedOK": "importFileUploadedOK",
			"permissions": "permissions"
		},

		initialize: function() {
			var self = this;

       // Get the data from the template #data-servers
      var data = _.template($("#data-databases").html());
      this.databasesCollection = new DatabasesCollection(JSON.parse(data()));

      // this.databaseModel.on("change", this.render, this);

      // create a new title and add it to the title region in the layout
      // if we need to change the title we just do this.title.set("new title");
      this.title = new Title();
      layout.title.show(this.title);

      // listen to all events in this.listenTo and execute the value
      _.each(this.listenTo, function(value, index) {
        Backbone.on(index, function(options) {
          self[value](options);
        });
      });

      // start listening to all io events
      this.listenIO();
		},

		// listen to IO events
		listenIO: function() {
			io.on("databases:added", function(model) {
				self.databasesCollection.add(model);
			});

			io.on("databases:removed", function(model) {
				var model = new Model(data);
				self.databasesCollection.remove(model);
			});
		},

		// the route view/someid will be handled by this
		// Loads the model and calls self.viewDatabase
		router_viewDatabaseView: function(id) {
			loading.show();
      var self = this;

      // Fetch the collection of servers
      this.databasesCollection.fetch({
        success: function(models, response) {
          // look for a model with the id defined
          var model = self.databasesCollection.get(id);

          // this is firing twice, don't know if this has consecuences
          self.viewDatabase({model: model});
          loading.hide();
        }
      });
		},

		router_viewUsersView: function(databaseid) {
			loading.show();

			var self = this;
			this.databaseUsersCollection = new DatabaseUsersCollection({database: databaseid});

			this.databaseUsersCollection.fetch({
				success: function(models, results){
					self.viewUsers({collection: models, database: databaseid});
					loading.hide();
				}
			})
		},

		router_viewBackupsView: function(databaseid) {
			loading.show();

			var self = this;
			this.backupsCollection = new BackupsCollection({database: databaseid});

			this.backupsCollection.fetch({
				success: function(models, results){
					self.viewBackups({collection: models, database: databaseid});
					loading.hide();
				}
			})
		},

		// Show all databases in a table
		viewDatabases: function() {
			// show loading
      loading.show();
      this.title.set("Databases");

      // Set the menu
      layout.actionsmenu.show(new MenuView({title: "Add database", name: "add"}));

      // add the viewServers to the main region in the layout
      var viewDatabases = new ViewDatabases({collection: this.databasesCollection});
      layout.main.show(viewDatabases);

      // hide loading
      loading.hide();
		},

		// View a database in a new page
		// the route view/someid will be handled by this one too
		viewDatabase: function(options) {
			var self = this;
      self.title.set(options.model.toJSON().database_name);

      // replace the main region with the ShowServerView and pass the model
      layout.main.show(new ViewDatabase({model: options.model}));

      var menu = new MenuDatabaseView({
      	model: options.model
      });

      layout.dropdownmenu.show(menu);
		},

		// Shows a form to add a new database
		showAddDatabaseForm: function(options) {
			var self = this;

			var serversCollection = new ServersCollection();
			serversCollection.fetch().done(function() {
	      var addDatabaseForm = new AddDatabaseFormView({
	      	collection: self.databasesCollection,
	      	servers: serversCollection
	      });

	      var modal = new Backbone.BootstrapModal({
	        title: "Add database",
	        content: addDatabaseForm,
	        animate: true,
	        modalOptions: {
	    			backdrop: false
	    		}
	      });

	      // Prevent zombie views by forcing the modal to be shown in #modals
	      // and let Marionette handle the $el and closing
	      layout.modals.show(modal);
	      modal.open();
			});
    },

    lockDatabase: function(options) {
			var self = this;
			var id = options.model.toJSON()._id;

			options.model.lockDatabase();

			// the model will fire a success or error event on completion
			options.model.on("lockDatabase:success", function(data) {
				options.model.set({isLocked: true});
			})

			options.model.on("lockDatabase:error", function(error) {
				console.log("@todo implement the alert error");
				// alert.error(error.responseText);
			});
    },

    unlockDatabase: function(options) {
    	var self = this;
			var id = options.model.toJSON()._id;

			options.model.unlockDatabase();

			// the model will fire a success or error event on completion
			options.model.on("unlockDatabase:success", function(data) {
				options.model.set({isLocked: false});
			})

			options.model.on("unlockDatabase:error", function(error) {
				console.log("@todo implement the alert error");
				// alert.error(error.responseText);
			});
    },

    openModalToConfirmRemovalOfDatabase: function(options) {
    	var self = this;

    	var modal = new Backbone.BootstrapModal({
    		title: "Confirm removal of datababase " + options.model.toJSON().database_name,
    		content: "This operation cannot be undone, if you click OK, the database will be removed",
    		animate: true,
    		modalOptions: {
    			backdrop: false
    		}
    	});

    	// Prevent zombie views by forcing the modal to be shown in #modals
      // and let Marionette handle the $el and closing
      layout.modals.show(modal);
      modal.open();

      modal.on("ok", function() {
        loading.show();
        // destroy the model
        options.model.destroy({wait: true});
        loading.hide();
      });
    },

    

    showTables: function(options) {
    	var self = this;

    	loading.show();
    	options.model.showTables();
    	options.model.on("showTables:success", function(data) {
	    	var dataView = new DataView(data).render();

	    	var modal = new Backbone.BootstrapModal({
	    		title: "Showing tables in database " + options.model.toJSON().database_name,
	    		content: dataView,
	    		modalOptions: {
	    			backdrop: false
	    		}
	    	});

	    	layout.modals.show(modal);
	    	loading.hide();
	    	modal.open();
    	})
    },

    showUsersInDatabase: function(options) {
    	var self = this;

    	loading.show();
    	options.model.showUsersInDatabase();
    	options.model.on("showUsersInDatabase:success", function(data) {
	    	var dataView = new DataView(data).render();

	    	var modal = new Backbone.BootstrapModal({
	    		title: "Showing users with access to database " + options.model.toJSON().database_name,
	    		content: dataView,
	    		modalOptions: {
	    			backdrop: false
	    		}
	    	});

	    	layout.modals.show(modal);
	    	loading.hide();
	    	modal.open();
    	})
    },

    viewUsers: function(options) {
    	var self = this;
    	loading.show();

    	// Get the datase model from the collection, this.databasesCollection will be set on the constructor
    	var database = this.databasesCollection.get(options.database);
    	self.title.set("Users with access to database " + database.toJSON().database_name);

    	// This collection is the databasesUsers collection passed from router_viewUsersView
    	// Instantiated and after a fetch
    	var collection = options.collection;

    	// Add the main view and pass the collection
    	layout.main.show(new ViewUsers({collection: collection}));

    	// Set the menu to add a new database
      layout.actionsmenu.show(new MenuView({
      	title: "Add user", 
      	name: "adduser",
      	model: database
      }));

    	// Add the menu again because this is a public path
    	var menu = new MenuDatabaseView({
      	model: database
      });

    	// Show the menu
      layout.dropdownmenu.show(menu);

    	loading.hide();
    },

    showAddUserToDatabaseForm: function(options) {
  		var addUserToDatabaseForm = new AddUserToDatabaseForm({
  			model: options.model, // a database model
  			collection: this.databaseUsersCollection // this is instantiated on initialize
  		});

  		var modal = new Backbone.BootstrapModal({
    		title: "Add user to database " + options.model.toJSON().database_name,
    		content: addUserToDatabaseForm,
    		modalOptions: {
    			backdrop: false
    		}
    	});

    	layout.modals.show(modal);
    	loading.hide();
    	modal.open();
    },

    showCreateBackupForm: function(options) {
    	var createBackupFormView = new CreateBackupFormView({
    		model: options.model, // a database model
    		collection: this.backupsCollection
    	});

    	var modal = new Backbone.BootstrapModal({
    		title: "Create backup of database " + options.model.toJSON().database_name,
    		content: createBackupFormView,
    		modalOptions: {
    			backdrop: false
    		}
     	});

     	layout.modals.show(modal);
     	loading.hide();
     	modal.open();
    },

    /** 
     * @param options struct modal with the new backup created 
     */
    showNewBackupCreatedModal: function(options) {
    	// show download link here
			var content = new DownloadBackupLinkView({
				model: options.model
			});

			// open a modal with the button
			var modal = new Backbone.BootstrapModal({
				title: "Backup ready!",
				content: content,
				allowCancel: false,
				animate: true,
				modalOptions: {
					backdrop: false
				}
			});

			layout.modals.show(modal);
    	modal.open();
    },

		viewBackups: function(options) {
			var self = this;
    	loading.show();

    	// Get the datase model from the collection, this.databasesCollection will be set on the constructor
    	var database = this.databasesCollection.get(options.database);
    	self.title.set("Backups for database " + database.toJSON().database_name);

    	// This collection is the databasesUsers collection passed from router_viewUsersView
    	// Instantiated and after a fetch
    	var collection = options.collection;

    	// Add the main view and pass the collection
    	layout.main.show(new ViewBackups({collection: collection}));

    	// Set the menu to add a new database
      layout.actionsmenu.show(new MenuView({
      	title: "Create backup", 
      	name: "createbackup",
      	model: database
      }));

    	// Add the menu again because this is a public path
    	var menu = new MenuDatabaseView({
      	model: database
      });

    	// Show the menu
      layout.dropdownmenu.show(menu);

    	loading.hide();
		},

    showImportModal: function(options) {
      var self = this;
      // send the database as model since options.models is a database model
      var importView = new ImportView({model: options.model});

      // open a modal with the button
      var modal = new Backbone.BootstrapModal({
        title: "Import into database " + options.model.toJSON().database_name,
        content: importView,
        allowCancel: false,
        okText: "Cancel",
        animate: true,
        modalOptions: {
          backdrop: false
        }
      });

      layout.modals.show(modal);
      modal.open();

      // Since we cannot hide the OK button, we hide the cancel and 
      // use the OK to cancel and close the modal
      modal.on("ok", this.close());
    },

    /** 
     * @param options {object}
      [options.file] the file model that was just uploaded
      [options.database] the database model of the destiny database
     */
    importFileUploadedOK: function(options) {
      var self = this;
      var file = options.file;
      var database = options.database;

      loading.show();
      database.importDatabase(file.toJSON()._id);
      database.on("importDatabase:success", function(response) {
        loading.hide();
        
        var modal = new Backbone.BootstrapModal({
          title: "Imported successfully the file to the database " + database.toJSON().database_name,
          content: "The import was successfull",
          animate: true,
          allowCancel: false,
          modalOptions: {
            backdrop: false
          }
        });


        layout.modals.show(modal);
        modal.open();
      })

      database.on("importDatabase:error", function(error) {
        loading.hide();

        var modal = new Backbone.BootstrapModal({
          title: "Error when importing to database " + database.toJSON().database_name,
          content: error.responseText,
          animate: true,
          allowCancel: false,
          modalOptions: {
            backdrop: false
          }
        });


        layout.modals.show(modal);
        modal.open();
      })
    }
	});

	return Controller;
});
