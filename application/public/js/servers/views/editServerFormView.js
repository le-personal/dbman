define(function(require) {
	var Backbone = require("backbone");
	var Marionette = require("marionette");
	var Server = require("/js/servers/models/model.js");
	var loading = require("/js/lib/loading.js");
  var alert = require("/js/lib/alert.js");

	var EddServerFormView = Backbone.Marionette.ItemView.extend({
		template: function(model) {
			return _.template($("#editServerTemplate").html(), {model: model});
		},
		initialize: function() {
			console.log(this.model);
			this.bind("ok", this.okClicked);
		},
		ui: {
			name: 'input[name="name"]',
			ssh_username: 'input[name="ssh_username"]',
			ssh_keypath: 'input[name="ssh_keypath"]',
			ssh_port: 'input[name="ssh_port"]',
			type: 'select[name="service[type]"]',
			username: 'input[name="service[username]"]',
			password: 'input[name="service[password]"]',
			port: 'input[name="service[port]"]'
		},
		okClicked: function() {
			var self = this;
			var data = {
				name: this.ui.name.val(),
				ssh_username: this.ui.ssh_username.val(),
				ssh_keypath: this.ui.ssh_keypath.val(),
				ssh_port: this.ui.ssh_port.val(),
				service: {
					username: this.ui.username.val(),
					port: this.ui.port.val(),
				}
			}

			// If there's a new password, add it
			if(this.ui.password.val().length > 0) {
				data.service.password = this.ui.password.val();
			}

			var model = this.model;
			model.set(data);
			model.save({}, {
				success: function(model, response) {},
				error: function(model, response) {
					// alert.error(response.responseText);
				}
			});

			self.collection.set(model);
			self.collection.reset();
		}
	});

	return EddServerFormView;
});