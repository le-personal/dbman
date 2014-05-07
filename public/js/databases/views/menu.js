define(function(require) {

	var Backbone = require("backbone");
	var Marionette = require("marionette");

	var Menu = Backbone.Marionette.ItemView.extend({
		template: "#database-menu"
	});

	return Menu;
});