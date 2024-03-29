define(function(require) {
	var Backbone = require("backbone");
	var jQuery = require("jquery");
	
	var Database = Backbone.Model.extend({
		urlRoot: "/api/databases",
		defaults: {
			database_name: "",
			description: "",
			created: '',
			server: '',
			author: '',
			permissions: {
				view: [],
				edit: [],
				import: [],
				remove: []
			},
			users: {},
			backups: {},
			isLocked: false,
		},
		idAttribute: "_id",
		getDatabase: function() {
			var self = this;
			self.fetch({
				success: function(model, response) {
					self.trigger("getDatabase:success", model, response);
				},
				error: function(model, response) {
					console.log(response);
					alert.error("There was an error");
					self.trigger("getDatabase:error", response);
				}
			});
		},
		showTables: function() {
			var self = this;
			var url = this.urlRoot;
			var id = this.toJSON()._id;
			jQuery.post(url + "/showtables", {id: id}, function(response) {
				if(response) {
					self.trigger("showTables:success", response);
				}
			}, "json").fail(function(error) {
				self.trigger("showTables:error", error);
			});
		},
		showUsersInDatabase: function(id) {
			var self = this;
			var url = this.urlRoot;
			var id = this.toJSON()._id;
			jQuery.post(url + "/showusersindatabase", {id: id}, function(response) {
				if(response) {
					self.trigger("showUsersInDatabase:success", response);
				}
			}, "json").fail(function(error) {
				self.trigger("showUsersInDatabase:error", error);
			});
		},
		lockDatabase: function() {
			var self = this;
			var url = this.urlRoot;
			var id = this.toJSON()._id;

			jQuery.post(url + "/lock", {id: id}, function(response) {
				if(response) {
					self.trigger("lockDatabase:success", response);
				}
			}, "json").fail(function(response) {
				self.trigger("lockDatabase:error", response);
			});
		},
		unlockDatabase: function() {
			var self = this;
			var url = this.urlRoot;
			var id = this.toJSON()._id;
			jQuery.post(url + "/unlock", {id: id}, function(response) {
				if(response) {
					self.trigger("unlockDatabase:success", response);
				}
			}, "json").fail(function(response) {
				self.trigger("unlockDatabase:error", response);
			});
		},
		importDatabase: function(fileid) {
			var self = this;
			var url = this.urlRoot;
			// the id is needed by the isUnlock library
			jQuery.post(url + "/import", {id: this.toJSON()._id, file: fileid}, function(response) {
				if(response) {
					self.trigger("importDatabase:success", response);
				}
			}, "json").fail(function(response) {
				console.log(response);
				self.trigger("importDatabase:error", response);
			});
		},
		addPermission: function(userid, permission) {
			var self = this;
			var url = this.urlRoot;

			jQuery.post(url + "/permissions", {user: userid, permission: permission, database: this.toJSON()._id, op: "add"}, function(response) {
				if(response) {
					self.trigger("addPermission:success", response);
				}
			}, "json").fail(function(error) {
				console.log("error");
				console.log(error);
				self.trigger("addPermission:error", error);
			});
		},
		removePermission: function(userid, permission) {
			var self = this;
			var url = this.urlRoot;

			jQuery.post(url + "/permissions", {user: userid, permission: permission, database: this.toJSON()._id, op: "remove"}, function(response) {
				console.log(response);
				if(response) {
					self.trigger("removePermission:success", response);
				}
			}, "json").fail(function(error) {
				console.log("error");
				console.log(error);
				self.trigger("removePermission:error", error);
			});
		},
	});

	return Database;
});