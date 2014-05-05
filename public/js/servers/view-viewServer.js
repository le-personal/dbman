define([
		"jquery"
	, "underscore"
	, "backbone"
	, "marionette"
	, "/js/servers/model.js"
	, "/js/servers/collection.js"
], function($, _, Backbone, Marionette, Model, Collection) {
	var ViewServer = Backbone.Marionette.ItemView.extend({
		tagName: "tr",
		template: "#view-server"
	});

	return ViewServer;
});