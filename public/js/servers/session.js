define([
	"jquery",
	"underscore",
	"backbone",
	"marionette"
], function($, _, Backbone, Marionette) {
	var Session = function() {
		this.user = {};

		_.extend(this, Backbone.Events);
	}

	Session.prototype.load = function() {
		var self = this;
		var url = "/api/session";
		$.get(url, function(response) {
			if(response) {
				self.user = response;

				self.trigger("sessionLoaded", self.user);
			}
		}, "json").fail(function(error) {
			console.log(error);
			self.user = {};
		});
	}

	Session.prototype.get = function() {
		return this.user;
	}

	Session.prototype.isAdmin = function() {
		return this.user.isAdmin;
	}

	return Session;
});