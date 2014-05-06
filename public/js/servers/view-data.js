define([
	"/js/App.js",
	"jquery",
	"underscore",
	"backbone",
	"marionette"
], function(App, $, _, Backbone, Marionette) {
	var DataView = Backbone.Marionette.CompositeView.extend({
		template: _.template($("#data-template").html()),
		render: function() {
			this.$el.html(this.template({
				stdout: this.options.stdout, 
				stderr: this.options.stderr
			}));

			App.vent.trigger("hideLoading");
		}
	});

	return DataView;
});