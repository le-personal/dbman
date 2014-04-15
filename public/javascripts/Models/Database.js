App.Models.Database = Backbone.Model.extend({
	urlRoot: "/api/databases",
	defaults: {
		database_name: "",
		created: '',
		server: '',
		author: '',
		permissions: {
			edit: [],
			import: [],
			restore: [],
			backup: [],
			remove: []
		},
		isLocked: false,
	},
	showTables: function(id) {
		var self = this;
		var url = this.urlRoot;
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
		jQuery.post(url + "/showusersindatabase", {id: id}, function(response) {
			if(response) {
				self.trigger("showUsersInDatabase:success", response);
			}
		}, "json").fail(function(error) {
			self.trigger("showUsersInDatabase:error", error);
		});
	},
	showDatabases: function(server) {
		var self = this;
		var url = this.urlRoot;
		jQuery.post(url + "/showdatabases", {server: server}, function(response) {
			if(response) {
				self.trigger("showDatabases:success", response);
			}
		}, "json").fail(function(error) {
			self.trigger("showDatabases:error", error);
		});
	},
	lockDatabase: function(id) {
		var self = this;
		var url = this.urlRoot;
		jQuery.post(url + "/lock", {id: id}, function(response) {
			if(response) {
				self.trigger("lockDatabase:success", response);
			}
		}, "json").fail(function(response) {
			self.trigger("lockDatabase:error", response);
		});
	},
	unlockDatabase: function(id) {
		var self = this;
		var url = this.urlRoot;
		jQuery.post(url + "/unlock", {id: id}, function(response) {
			if(response) {
				self.trigger("unlockDatabase:success", response);
			}
		}, "json").fail(function(response) {
			self.trigger("unlockDatabase:error", response);
		});
	},
	importDatabase: function(dbid, fileid) {
		var self = this;
		var url = this.urlRoot;
		// the id is needed by the isUnlock library
		jQuery.post(url + "/import", {id: dbid, file: fileid}, function(response) {
			if(response) {
				self.trigger("importDatabase:success", response);
			}
		}, "json").fail(function(response) {
			console.log(response);
			self.trigger("importDatabase:error", response);
		});
	},
});
