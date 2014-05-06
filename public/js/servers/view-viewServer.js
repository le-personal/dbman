define([
		"/js/App.js"
	,	"jquery"
	, "underscore"
	, "backbone"
	, "marionette"
	, "/js/servers/model.js"
	, "/js/servers/collection.js"
	, "/js/servers/view-showServer.js"
	, "/js/servers/view-data.js"
], function(App, $, _, Backbone, Marionette, Model, Collection, ShowServerView, DataView) {
	var ViewServer = Backbone.Marionette.ItemView.extend({
		tagName: "tr",
		template: "#view-server",
		events: {
			"click .view": "showServerView",
			"click .test": "testConnection"
		},
		showServerView: function() {
			// App.navigate("view", this.model.toJSON()._id);
			this.trigger("showServerView", this.model);
		},
		testConnection: function() {
			// App.navigate("testConnection", this.model.toJSON()._id);
			// App.vent.trigger("showLoading");

			// App.title.set("Test connection to " + this.model.toJSON().name);
			this.trigger("testConnection", this.model.toJSON()._id);
		}
	});

	return ViewServer;
});