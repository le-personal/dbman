define(function(require) {

	var Backbone = require("backbone");
	var Marionette = require("marionette");
	var navigate = require("/js/lib/navigator.js");

	var Menu = Backbone.Marionette.ItemView.extend({
		template: "#database-menu",
		events: {
			"click a.showAddUserToDatabaseForm": "showAddUserToDatabaseForm",
			"click a.showTables": "showTables",
			"click a.showUsersInDatabase": "showUsersInDatabase",
			"click a.viewBackups": "viewBackups",
			"click a.createBackup": "showCreateBackupForm",
			"click a.import": "import",
			"click a.permissions": "administerPermissions"
		},
		showAddUserToDatabaseForm: function(e) {
			e.preventDefault();
			Backbone.trigger("showAddUserToDatabaseForm", {model: this.model});
		},
		showTables: function(e) {
			e.preventDefault();
			Backbone.trigger("showTables", {model: this.model});
		},
		showUsersInDatabase: function(e) {
			e.preventDefault();
			Backbone.trigger("showUsersInDatabase", {model: this.model});
		},
		viewBackups: function(e) {
			e.preventDefault();
			navigate.toPath("#view/" + this.model.toJSON()._id + "/backups", true);
		},
		showCreateBackupForm: function(e) {
			e.preventDefault();
			Backbone.trigger("showCreateBackupForm", {model: this.model});
		},
		import: function(e) {
			e.preventDefault();
		},
		administerPermissions: function(e) {
			e.preventDefault();
		}
	});

	return Menu;
});
