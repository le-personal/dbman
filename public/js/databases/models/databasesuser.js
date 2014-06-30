/**
 * Extends Backbone.Model
 * @params options struct with properties:
 * - database string the database id as a string
 */
define(function(require) {
	var Backbone = require("backbone");

	var DatabasesUser = Backbone.Model.extend({
		initialize: function(options) {
			this.database = options.database;
		},
		defaults: {
			username: '',
			password: '',
			allowedHosts: [],
			created: '',
			database: ''
		},
		idAttribute: "_id",
		url: function() {
			return "/api/databases/" + this.database + "/users";
		},
		delete: function(userid, callback) {
			var url = this.url() + "/" + userid;
			
			$.ajax({
				url: url,
				dataType: "json",
				type: "DELETE",
				success: function(response, status) {
					callback(null, response);
				},
				error: function(c, status, error) {
					callback(error, null);
				}
			});
		}
	});

	return DatabasesUser;
});