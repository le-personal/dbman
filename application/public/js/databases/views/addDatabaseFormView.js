define(function(require) {
	var $ = require("jquery");
	var Backbone = require("backbone");
	var Marionette = require("marionette");

	var alert = require("/js/lib/alert.js");

	var loading = require("/js/lib/loading.js");
	var Database = require("/js/databases/models/database.js");

	var AddDatabaseFormView = Backbone.Marionette.CompositeView.extend({
		template: _.template($("#add-database").html()),
		initialize: function() {
			this.bind("ok", this.okClicked);
			console.log(this.collection);
		},
		render: function() {
			this.$el.html(this.template({
				servers: this.options.servers.toJSON()
			}));
			return this;
		},
		ui: {

		},
		okClicked: function() {
			var self = this;

			var model = new Database();

			var data = {}
			var formValues = $("form").serializeArray();
			_.each(formValues, function(element) {
				console.log("@todo If you see this, use this.ui.element.val() instead of looping");
				console.log(element.name);

				data[element.name] = element.value;
			});

			model.save(data, {
				success: function(m, response) {
					loading.hide();
					self.collection.add(m);
				},
				error: function(m, error) {
					alert.error(error.responseText);
				}
			});
		}
	});

	return AddDatabaseFormView;
});