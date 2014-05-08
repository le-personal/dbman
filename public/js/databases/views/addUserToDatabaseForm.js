define(function(require) {
	var Backbone = require("backbone");
	var Marionette = require("marionette");
	var DatabasesUser = require("/js/databases/models/databasesuser.js");
	var loading = require("/js/lib/loading.js");

	var AddUserToDatabaseForm = Backbone.Marionette.CompositeView.extend({
		template: _.template($("#add-database-user").html()),
		initialize: function() {
			this.bind("ok", this.okClicked);
		},
		render: function() {
			this.$el.html(this.template({database: this.model.toJSON()}));
			return this;
		},
		okClicked: function() {
			loading.show();
			
			var self = this;
			var data = [];
			var formValues = $("form").serializeArray();
			_.each(formValues, function(element) {
				data[element.name] = element.value;
			});

			var model = new DatabasesUser({database: this.model.toJSON()._id});
			model.save(data, {
				success: function(m, response) {
					loading.hide();
					self.collection.add(m);
				},
				error: function(m, error) {
					console.log("@todo: implement the error messages like alert.error");
					// alert.error(error.responseText);
				}
			});
		}
	});

	return AddUserToDatabaseForm;
});