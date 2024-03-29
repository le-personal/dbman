define(function(require) {

	var $ = require("jquery");
	var _ = require("underscore");
	var Backbone = require("backbone");
	var Marionette = require("marionette");

	var LayoutView = Backbone.Marionette.Layout.extend({
		template: "#layout",
		regions: {
			main: "#main",
			title: "#title",
			actionsmenu: "#actionsmenu",
			dropdownmenu: "#dropdownmenu",
			modals: "#modals"
		}
	});

	return new LayoutView();
});