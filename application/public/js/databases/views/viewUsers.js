define(function(requiere) {
	var Backbone = requiere("backbone");
	var Marionette = require("marionette");
	var EmptyView = require("/js/common/views/empty.js");

	var alert = require("/js/lib/alert.js");

	var ViewUsersRow = Backbone.Marionette.ItemView.extend({
		tagName: "tr",
		template: "#viewusers-row",
		events: {
			"click .removeDatabaseUser": "dropUser"
		},
		initialize: function() {
			this.model.on("change", this.render, this);
		},
		onRender: function() {
		},
		dropUser: function() {
			var self = this;
			var collection = this.model.collection;

			var userid = this.model.toJSON()._id;
			this.model.delete(userid, function(err, response) {
				if(err) {
					alert.error(err);
				}

				collection.remove(self.model);
			});
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