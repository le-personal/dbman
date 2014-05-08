define(function(require) {
	var Backbone = require("backbone");
	var Marionette = require("marionette");

	var EmptyView = Backbone.Marionette.CompositeView.extend({
		template: "#empty-view",
		
	});

	return EmptyView;
});