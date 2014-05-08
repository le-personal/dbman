define(function(requiere) {
	var Backbone = requiere("backbone");
	var Marionette = require("marionette");
	var EmptyView = require("/js/common/views/empty.js");

	var ViewUsersRow = Backbone.Marionette.ItemView.extend({
		tagName: "tr",
		template: "#viewusers-row",
		initialize: function() {
			this.model.on("change", this.render, this);
		},
		onRender: function() {
			console.log("@todo implement drop");
		}
	});

	var ViewUsers = Backbone.Marionette.CompositeView.extend({
		itemView: ViewUsersRow,
		template: "#viewusers",
		itemViewContainer: "tbody",
		emptyView: EmptyView,
	});

	return ViewUsers;
});