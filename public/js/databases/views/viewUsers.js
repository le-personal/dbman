define(function(requiere) {
	var Backbone = requiere("backbone");
	var Marionette = require("marionette");
	var EmptyView = require("/js/common/views/empty.js");

	var ViewUsersRow = Backbone.Marionette.ItemView.extend({
		tagName: "tr",
		template: "#viewusers-row",
		initialize: function() {
			this.model.on("change", this.render, this);
		}
	});

	var ViewUsers = Backbone.Marionette.CompositeView.extend({
		itemView: ViewUsersRow,
		template: "#viewusers",
		itemViewContainer: "tbody",
		emptyView: EmptyView,
		onRender: function() {
			
		}
	});

	return ViewUsers;
});