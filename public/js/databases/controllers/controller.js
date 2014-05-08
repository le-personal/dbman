define(function(require) {

	var _ = require("underscore");
	var $ = require("jquery");
	var Backbone = require("backbone");
	var Marionette = require("marionette");
	var BootstrapModal = require("backboneBootstrapModal");
	
	var io = require("/js/lib/io.js");
  var loading = require("/js/lib/loading.js");

  var DatabasesCollection = require("/js/databases/collections/databases.js");
  var Database = require("/js/databases/models/database.js");
  var ServersCollection = require("/js/servers/collections/collection.js");
  
  var layout = require("/js/common/views/layout.js");
  var Title = require("/js/common/views/title.js");
  var DataView = require("/js/common/views/data.js");
  var MenuView = require("/js/common/views/menu.js");
  var MenuDatabaseView = require("/js/databases/views/menu.js");

	var ViewDatabases = require("/js/databases/views/viewDatabases.js");
	var ViewDatabase = require("/js/databases/views/viewDatabase.js");
	var AddDatabaseFormView = require("/js/databases/views/addDatabaseFormView.js");

	var Controller = Backbone.Marionette.Controller.extend({
		// application events we should be listenting to here
		listenTo: {
			'viewDatabase': 'viewDatabase',
			'showAddDatabaseForm': 'showAddDatabaseForm',
			"onClick:menu:add": "showAddDatabaseForm",
			"lockDatabase": "lockDatabase",
			"unlockDatabase": "unlockDatabase",
			"removeDatabase": "openModalToConfirmRemovalOfDatabase",
			"showTables": "showTables",
			"showUsersInDatabase": "showUsersInDatabase",
			"listBackups": "listBackups",
			"createBackup": "createBackup",
			"import": "import",
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

		// Show all databases in a table
		viewDatabases: function() {
			// show loading
      loading.show();
      this.title.set("Databases");
      
      // Set the menu
      layout.menu.show(new MenuView({title: "Add databases", name: "add"}));

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
      
      var menu = new MenuDatabaseView({model: options.model});
      layout.menu.show(menu);
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
	        animate: true
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
    		animate: true
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
	    		content: dataView
	    	});

	    	layout.modals.show(modal);
	    	loading.hide();
	    	modal.open();
    	})
    },

	});

	return Controller;
});