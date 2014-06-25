define(function(require) {

	var Backbone = require("backbone");
	var Marionette = require("marionette");
	var Backup = require("/js/databases/models/backup.js");
	var loading = require("/js/lib/loading.js");
	var alert = require("/js/lib/alert.js");

	var CreateBackupFormView = Backbone.Marionette.CompositeView.extend({
		template: _.template($("#create-backup").html()),
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

			var model = new Backup({database: this.model.toJSON()._id});
			model.save(data, {
				success: function(m, response) {
					loading.hide();
					self.collection.add(m);

					Backbone.trigger("showNewBackupCreatedModal", {model: m});
				},
				error: function(m, error) {
					alert.error(error.responseText);
				}
			});
		}
	});

	return CreateBackupFormView;
});