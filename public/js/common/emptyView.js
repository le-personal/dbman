define(function(require) {
	var Backbone = require("backbone");
	var Marionette = require("marionette");

	var EmptyView = Backbone.Marionette.ItemView.extend({
		tagName: "tr",
		template: "#empty-view",
	});

	return EmptyView;
});