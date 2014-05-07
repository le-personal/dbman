define(function(require) {

	var Backbone = require("backbone");
	var Marionette = require("marionette");
	var ViewDatabaseRow = require("/js/databases/views/viewDatabaseRow.js");

	var ViewDatabases = Backbone.Marionette.CompositeView.extend({
		template: "#view-databases",
		itemView: ViewDatabaseRow,
		itemViewContainer: "tbody",
	});

	return ViewDatabases;
});