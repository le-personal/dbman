define(function(require) {

	var Backbone = require("backbone");
	var Marionette = require("marionette");

	var EmptyView = require("/js/common/views/empty.js");

	var ViewBackupRow = Backbone.Marionette.ItemView.extend({
		tagName: "tr",
		template: "#viewbackups-row"
	});

	var ViewBackups = Backbone.Marionette.CompositeView.extend({
		template: "#viewbackups",
		itemView: ViewBackupRow,
		itemViewContainer: "tbody",
		emptyView: EmptyView,
		onRender: function() {
		}
	});

	return ViewBackups;
});