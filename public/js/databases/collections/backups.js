define(function(require) {
	var Backbone = require("backbone");
	var Backup = require("/js/databases/models/backup.js");

	var Backups = Backbone.Collection.extend({
		model: Backup,
		url: "/api/databases/backups"
	});
	
	return Backups;
});
