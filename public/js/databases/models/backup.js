define(function(require) {
	var Backbone = require("backbone");
	
	var Backup = Backbone.Model.extend({
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
		idAttribute: "_id"
	});
	
	return Backup;
});