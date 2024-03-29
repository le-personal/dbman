define(function(require) {

	var Backbone = require("backbone");
	var Marionette = require("marionette");

	var ViewDatabaseRow = Backbone.Marionette.ItemView.extend({
		template: "#view-databases-row",
		tagName: "tr",
		events: {
			"click .lockDatabase": "lockDatabase",
			"click .unlockDatabase": "unlockDatabase",
			"click .removeDatabase": "removeDatabase",
			"click .showDatabasesOnServer": "showDatabasesOnServer",
			"click .editDatabase": "editDatabase"
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
		},
		removeDatabase: function() {
			Backbone.trigger("removeDatabase", {model: this.model});
		},
		showDatabasesOnServer: function() {
			Backbone.trigger("showDatabasesOnServer", {model: this.model});
		},
		editDatabase: function() {
			Backbone.trigger("showEditDatabaseForm", {model: this.model});
		}
	});

	return ViewDatabaseRow;
});