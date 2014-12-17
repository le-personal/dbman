define(['backbone', 'marionette'], function(Backbone, Marionette) {
	return Backbone.Marionette.AppRouter.extend({
		appRoutes: {
		  "": "viewServers", // call the method viewServers in the controller, which will be passed when instantiating the router
			"view/:id": "router_showServerView"
		}
	});
});