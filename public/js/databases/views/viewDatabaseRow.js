define(function(require) {

	var Backbone = require("backbone");
	var Marionette = require("marionette");

	var ViewDatabaseRow = Backbone.Marionette.ItemView.extend({
		template: "#view-databases-row",
		tagName: "tr",
		events: {
			"click .lockDatabase": "lockDatabase",
			"click .unlockDatabase": "unlockDatabase"
		},
		lockDatabase: function() {
			Backbone.trigger("lockDatabase", {model: this.model});
		},
		unlockDatabase: function() {
			Backbone.trigger("unlockDatabase", {model: this.model});
		}
	});

	return ViewDatabaseRow;
});