define([
		"jquery"
	, "underscore"
	, "backbone"
	, "marionette"
], function($, _, Backbone, Marionette) {
	var ViewTitle = Backbone.Marionette.ItemView.extend({
		template: "#title-template",
		ui: {
			title: "span.title"
		},
		onRender: function() {
			this.ui.title.text(this.options.title);
		},
		set: function(title) {
			this.ui.title.text(title);
		}
	});

	return ViewTitle;
});