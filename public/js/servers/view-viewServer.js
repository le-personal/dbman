define(function(require) {
	var Backbone = require("backbone");
	var Marionette = require("marionette");
	var Model = require("/js/servers/model.js");
	var Collection = require("/js/servers/collection.js");
	var vent = require("/js/servers/vent.js");

	var ViewServer = Backbone.Marionette.ItemView.extend({
		tagName: "tr",
		template: "#view-server",
		events: {
			"click .view": "showServerView",
			"click .test": "testConnection"
		},
		showServerView: function() {
			Backbone.trigger("showServerView", {model: this.model});
		},
		testConnection: function() {
			Backbone.trigger("testConnection", {model: this.model});
		}
	});

	return ViewServer;
});