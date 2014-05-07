define(function(require) {
	var Backbone = require("backbone");
	
	var Backup = Backbone.Model.extend({
		urlRoot: "/api/databases/backups"
	});
	
	return Backup;
});