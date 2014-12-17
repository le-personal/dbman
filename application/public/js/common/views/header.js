define(function(require) {
	var $ = require("jquery");
	var _ = require("underscore");
	var Backbone = require("backbone");
	var Marionette = require("marionette");
	
	var ViewHeader = Backbone.Marionette.CompositeView.extend({
		template: _.template($("#header-template").html()),
		render: function() {
			this.$el.html(this.template({isAdmin: this.options.user.isAdmin}));
		},
		initialize: function() {
			console.log("initialized");
			Backbone.on("setMenuActive", function(activeClassName) {
				console.log(activeClassName);

				// remove all active classes from any li element
				$("ul.nav li.active").removeClass("active");

				// add the class to the specified element
				$("ul.nav li." + activeClassName).addClass("active");
			});
		}
	});

	return ViewHeader;
});