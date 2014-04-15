App.Models.File = Backbone.Model.extend({
	urlRoot: "/api/files",
	defaults: {
		size: '',
		type: '',
		name: '',
		path: '',		
	}
});