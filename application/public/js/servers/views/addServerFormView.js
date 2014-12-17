define(function(require) {
	var Backbone = require("backbone");
	var Marionette = require("marionette");
	var Server = require("/js/servers/models/model.js");
	var loading = require("/js/lib/loading.js");

	var AddServerFormView = Backbone.Marionette.ItemView.extend({
		template: "#addServerTemplate",
		initialize: function() {
			this.bind("ok", this.okClicked);
			console.log(this.collection);
		},
		ui: {
			name: 'input[name="name"]',
			ip: 'input[name="ip"]',
			ssh_username: 'input[name="ssh_username"]',
			ssh_keypath: 'input[name="ssh_keypath"]',
			ssh_port: 'input[name="ssh_port"]',
			os: 'select[name="os"]',
			type: 'select[name="service[type]"]',
			username: 'input[name="service[username]"]',
			password: 'input[name="service[password]"]',
			port: 'input[name="service[port]"]'
		},
		okClicked: function() {
			var self = this;
			var data = {
				name: this.ui.name.val(),
				ip: this.ui.ip.val(),
				ssh_username: this.ui.ssh_username.val(),
				ssh_keypath: this.ui.ssh_keypath.val(),
				ssh_port: this.ui.ssh_port.val(),
				os: this.ui.os.val(),
				service: {
					type: this.ui.type.val(),
					username: this.ui.username.val(),
					password: this.ui.password.val(),
					port: this.ui.port.val(),
				}
			}

			var model = new Server();
			model.save(data, {
				success: function(model) {
					loading.hide();
					self.collection.add(model);
				},
				error: function(model, response, xhr) {
					loading.hide();
				}
			});
		}
	});

	return AddServerFormView;
});