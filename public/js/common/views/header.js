define(function(require) {
	var $ = require("jquery");
	var _ = require("underscore");
	var Backbone = require("backbone");
	var Marionette = require("marionette");
	
	var ViewHeader = Backbone.Marionette.CompositeView.extend({
		template: _.template($("#header-template").html()),
		render: function() {
			this.$el.html(this.template({isAdmin: this.options.user.isAdmin}));
		}
	});

	return ViewHeader;
});