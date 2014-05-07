define(function(require) {
	var Backbone = require("backbone");

	var File = Backbone.Model.extend({
		urlRoot: "/api/files",
		defaults: {
			size: '',
			type: '',
			name: '',
			path: '',		
		}
	});

	return File;
})