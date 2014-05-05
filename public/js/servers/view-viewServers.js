define([
		"jquery"
	, "underscore"
	, "backbone"
	, "marionette"
	, "/js/servers/model.js"
	, "/js/servers/collection.js"
	, "/js/servers/view-viewServer.js"
], function($, _, Backbone, Marionette, Model, Collection, ViewServer) {
	var ViewServers = Backbone.Marionette.CompositeView.extend({
		template: "#view-servers",
		itemView: ViewServer,
		itemViewContainer: "tbody",
		// emptyView: 
		onRender: function() {
			console.log("view-viewServers:rendered");
		}
	});

	return ViewServers;
});