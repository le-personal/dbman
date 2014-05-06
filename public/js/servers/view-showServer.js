define([
	"jquery",
	"underscore",
	"backbone",
	"marionette"
], function($, _, Backbone, Marionette) {
	var ShowServerView = Backbone.Marionette.CompositeView.extend({
		events: {
			"click .test": "testConnection"
		},
		template: "#showserver-template",
		testConnection: function() {
			Backbone.trigger("testConnection", {model: this.model});
		}
	});

	return ShowServerView;
});