define([
	"/js/App.js",
	"jquery",
	"underscore",
	"backbone",
	"marionette"
], function(App, $, _, Backbone, Marionette) {
	var ViewHeader = Backbone.Marionette.CompositeView.extend({
		template: _.template($("#header-template").html()),
		initialize: function() {
			console.log(this);

		},
		render: function() {
			this.$el.html(this.template({isAdmin: App.session.isAdmin()}));
		}
	});

	return ViewHeader;
});