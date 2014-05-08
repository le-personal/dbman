define(function(require) {
	var Backbone = require("backbone");
	var Marionette = require("marionette");

	var ViewBackupRow = Backbone.Marionette.ItemView.extend({
		tagName: "tr",
		template: "#viewbackups-row"
	});

	return ViewBackupRow;
});