define([
	"jquery",
	"underscore",
	"backbone",
	"marionette"
], function($, _, Backbone, Marionette) {
	var ShowServerView = Backbone.Marionette.CompositeView.extend({
		template: "#showserver-template",
	});

	return ShowServerView;
});