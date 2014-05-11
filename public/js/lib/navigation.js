define(function(require) {

	var $ = require("jquery");
	var Backbone = require("backbone");

	function Navigation() {

	}

	Navigation.prototype.set = {
		active: function(activeClassName) {
			console.log("triggering");
			// trigger an event, since we cannot do it here, we do it in the header view
			Backbone.trigger("setMenuActive", activeClassName);
		}
	}

	return Navigation;
});