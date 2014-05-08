define(function(require) {
	var Backbone = require("backbone");
	var Backup = require("/js/databases/models/backup.js");

	var Backups = Backbone.Collection.extend({
		model: Backup,
		initialize: function(options) {
			this.options = options;
			this.database = this.options.database;
		},
		url: function() {
    	return "/api/databases/" + this.database + '/backups';
  	}
	});
	
	return Backups;
});
