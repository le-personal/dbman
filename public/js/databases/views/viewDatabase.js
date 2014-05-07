define(function(require) {

	var Backbone = require("backbone");
	var Marionette = require("marionette");

	var ViewDatabase = Backbone.Marionette.CompositeView.extend({
		template: "#view-database"
	});

	return ViewDatabase;
});