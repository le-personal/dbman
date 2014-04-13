App.Models.Database = Backbone.Model.extend({
	urlRoot: "/api/databases",
	defaults: {
		database_name: "",
		created: '',
		database_user: "",
		database_password: '',
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
		allowedHosts: []
	},
	showTables: function(id) {
		var self = this;
		var url = this.urlRoot;
		jQuery.post(url + "/showtables", {id: id}, function(response) {
			if(response) {
				self.trigger("showTables:success", response);
			}
		}, "json").fail(function() {
			self.trigger("showTables:error");
		});
	},
	showDatabases: function(server) {
		var self = this;
		var url = this.urlRoot;
		jQuery.post(url + "/showdatabases", {server: server}, function(response) {
			if(response) {
				self.trigger("showDatabases:success", response);
			}
		}, "json").fail(function() {
			self.trigger("showDatabases:error");
		});
	}
});
