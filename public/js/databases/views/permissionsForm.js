define(function(require){

	var Backbone = require("backbone");
	var Marionette = require("marionette");
	var Users = require("/js/users/collections/users.js");
	var jqueryui = require("jqueryui");

	var PermissionForm = Backbone.Marionette.ItemView.extend({
		template: "#permissionsForm",
		initialize: function() {
			var self = this;
			this.users = new Users();
			this.users.fetch({
				success: function(models, results) {
					return self.render();
				},
				error: function(models, error) {

				}
			});

			this.bind("ok", this.okClicked);
		},
		onRender: function() {
			var self = this;
			var userNames = this.users.pluck("fullName");

			this.$("input#user").autocomplete({
				source: userNames,
				select: function(event, ui) {
					var selectedModel = self.users.where({fullName: ui.item.value})[0];
					var user = selectedModel.toJSON();

					// set the user._id in a hidden input
					$("#selectedUser").val(user._id);
				} 
			});
		},
		okClicked: function() {
			var self = this;
			
			var user = $("#selectedUser").val();
			var permission = $("select[name=access]").val();
			var database = this.model.toJSON();
			var id = database._id;
			
			if(permission && user && id) {
				self.model.addPermission(user, permission);
				self.model.on("addPermission:success", function(response) {
					self.collection.reset();
				})
			}
		}
	});

	return PermissionForm;
});