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

	Session.prototype.can = function(access, model) {
		var database = model.toJSON();

		_.where(database.permissions.view, this.user._id);

		switch(access) {
			case "view":
			if(_.where(database.permissions.view, this.user._id)) {
				return true;
			}
			break;

			case "remove":
			if(_.where(database.permissions.remove, this.user._id)) {
				return true;
			}
			break;

			case "import":
			if(_.where(database.permissions.import, this.user._id)) {
				return true;
			}
			break;

			case "edit":
			if(_.where(database.permissions.edit, this.user._id)) {
				return true;
			}
			break;
		}
	}

	return Session;
});