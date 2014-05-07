define([
		"jquery"
	, "underscore"
	, "backbone"
	, "marionette"
	, "/js/servers/models/model.js"
	, "/js/servers/collections/collection.js"
	, "/js/servers/views/viewServer.js"
], function($, _, Backbone, Marionette, Model, Collection, ViewServer) {
	var ViewServers = Backbone.Marionette.CompositeView.extend({
		template: "#view-servers",
		itemView: ViewServer,
		itemViewContainer: "tbody",
		// emptyView: 
		onRender: function() {
		}
	});

	return ViewServers;
});