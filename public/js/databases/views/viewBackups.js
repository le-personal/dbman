define(function(require) {

	var Backbone = require("backbone");
	var Marionette = require("marionette");

	var ViewBackupRow = require("/js/databases/views/viewBackupRow.js")

	var ViewBackups = Backbone.Marionette.CompositeView.extend({
		template: "#viewbackups",
		itemView: ViewBackupRow,
		itemViewContainer: "tbody",
		// emptyView: "",
		onRender: function() {
			console.log("@todo implement emptyView in ViewBackups");
		}
	});

	return ViewBackups;
});