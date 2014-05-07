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
		initialize: function() {
			// force a render when the model changes
			// the render method is provided by marionette
			this.model.on("change", this.render, this);
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