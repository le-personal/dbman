define(function(require) {
	var Backbone = require("backbone");
	var Marionette = require("marionette");
	var _ = require("underscore");

	var Menu = Backbone.Marionette.ItemView.extend({		
		template: _.template($("#context-menu").html()),
		events: {
			"click .btn": "onClick"
		},
		render: function() {
			var title = this.options.title;
			var type = "success";
			var name = this.options.name;

			this.$el.html(this.template({title: title, type: type, name: name}));
			return this;
		},
		onClick: function() {
			var event = "onClick:menu:" + this.options.name;
			// include the model passed on instantiation
			Backbone.trigger(event, {model: this.options.model, collection: this.options.collection});
		}
	});

	return Menu;
});