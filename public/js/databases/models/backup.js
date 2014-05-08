define(function(require) {
	var Backbone = require("backbone");
	
	var Backup = Backbone.Model.extend({
		initialize: function(options) {
			this.database = options.database;
		},
		defaults: {
			name: "",
			created: "",
			author: "",
			fileName: "",
			filePath: "",
			database: "",
			type: "",
			format: "",
			url: "",
			status: "",
			strategy: "",
			expires: "",
		},
		idAttribute: "_id",
		url: function() {
			return "/api/databases/" + this.database + "/backups";
		}
	});
	
	return Backup;
});