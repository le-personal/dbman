/** 
 * Defines the collection for servers 
 */
 
define([
		"jquery"
	, "underscore"
	, "backbone"
	, "/js/servers/models/model.js"
], function($, _, Backbone, Server) {
	var Servers = Backbone.Collection.extend({
		model: Server,
		url: "/api/servers"
	});

	return Servers;
});

