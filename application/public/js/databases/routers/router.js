define(function(require) {
	var Backbone = require("backbone");
	var Marionette = require("marionette");

	return Backbone.Marionette.AppRouter.extend({
		appRoutes: {
		  "": "viewDatabases", // call the method viewServers in the controller, which will be passed when instantiating the router
			"view/:id": "router_viewDatabaseView",
			"view/:databaseid/users": "router_viewUsersView",
			"view/:databaseid/backups": "router_viewBackupsView",
			"view/:databaseid/permissions": "router_viewPermissionsView"
		}
	});
});