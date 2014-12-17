define(function(require) {
	var $ = require("jquery");
	var Backbone = require("backbone");
	var Marionette = require("marionette");

	var loading = require("/js/lib/loading.js");
	var Database = require("/js/databases/models/database.js");

	var EditDatabaseFormView = Backbone.Marionette.CompositeView.extend({
		template: _.template($("#edit-database").html()),
		initialize: function() {
			this.bind("ok", this.okClicked);
			console.log(this.collection);
		},
		render: function() {
			this.$el.html(this.template({
				database: this.options.model.toJSON(),
				servers: this.options.servers.toJSON()
			}));
			return this;
		},
		ui: {
			description: "#form-input-description"
		},
		okClicked: function() {
			var self = this;

			var model = self.options.model;

			model.set({description: $("#form-input-description").val()});
			model.save();
		}
	});

	return EditDatabaseFormView;
});