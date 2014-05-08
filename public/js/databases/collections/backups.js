define(function(require) {
	var Backbone = require("backbone");
	var Backup = require("/js/databases/models/backup.js");

	var Backups = Backbone.Collection.extend({
		model: Backup,
		initialize: function(options) {
			this.database = options.database;
		},
		url: function() {
    	return "/api/databases/" + this.database + '/backups';
  	}
	});
	
	return Backups;
});
