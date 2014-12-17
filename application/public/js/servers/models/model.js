// Server model
define([
	"jquery",
	"underscore",
	"backbone"
], function($, _, Backbone) {
	var Model = Backbone.Model.extend({
		idAttribute: "_id",
		urlRoot: "/api/servers",
		defaults: {
			name: "",
			ip: "",
			ssh_username: '',
			ssh_keypath: '',
			ssh_port: '',
			os: '',
			created: '',
			author: '',
			service: {
				type: '',
				username: '',
				password: '',
				port: ''
			}
		},
		testConnection: function() {
			var self = this;
			var url = this.urlRoot;
			jQuery.post(url + "/test", {id: this.toJSON()._id}, function(response) {
				if(response) {
					self.trigger("testConnection:success", response);
				}
			}, "json").fail(function(error) {
				self.trigger("testConnection:error", error);
			});
		},

		showDatabases: function() {
			// Get the databases on a server
			var self = this;
			var url = this.urlRoot;
			var server = this.toJSON()._id;

			jQuery.post("/api/databases/showdatabases", {server: server}, function(response) {
				if(response) {
					self.trigger("showDatabases:success", response);
				}
			}, "json").fail(function(error) {
				self.trigger("showDatabases:error", error);
			});
		},
	});

	return Model;
});




