define(function(require) {
	var Backbone = require("backbone");
	var Marionette = require("marionette");
	var Model = require("/js/servers/model.js");
	var Collection = require("/js/servers/collection.js");
	var vent = require("/js/servers/vent.js");
	var navigate = require("/js/servers/navigator.js");

	var ViewServer = Backbone.Marionette.ItemView.extend({
		tagName: "tr",
		template: "#view-server",
		events: {
			"click .view": "showServerView",
			"click .test": "testConnection",
			"click .remove": "showDeleteServerConfirmationForm"
		},
		showServerView: function() {
			navigate.to("view", this.model.toJSON()._id, true);
		},
		testConnection: function() {
			Backbone.trigger("testConnection", {model: this.model});
		},
		showDeleteServerConfirmationForm: function() {
			Backbone.trigger("showDeleteServerConfirmationForm", {model: this.model});
		}
	});

	return ViewServer;
});