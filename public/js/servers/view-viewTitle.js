define([
		"jquery"
	, "underscore"
	, "backbone"
	, "marionette"
	, "/js/servers/model.js"
	, "/js/servers/collection.js"
], function($, _, Backbone, Marionette, Model, Collection) {
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