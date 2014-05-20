define([
	"jquery",
	"underscore",
	"backbone",
	"marionette"
], function($, _, Backbone, Marionette) {
	var ShowServerView = Backbone.Marionette.CompositeView.extend({
		events: {
			"click .test": "testConnection",
			"click .showdatabases": "showDatabasesOnServer"
		},
		template: "#showserver-template",
		testConnection: function() {
			Backbone.trigger("testConnection", {model: this.model});
		},
		showDatabasesOnServer: function() {
			Backbone.trigger("showDatabasesOnServer", {model: this.model});
		}
	});

	return ShowServerView;
});