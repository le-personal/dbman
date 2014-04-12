App.Models.Server = Backbone.Model.extend({
	urlRoot: "/api/servers",
	defaults: {
		name: "",
		ip: "",
		ssh_username: '',
		ssh_keyPath: '',
		ssh_port: '',
		os: '',
		created: '',
		author: '',
		service: {
			type: '',
			username: '',
			password: '',
			port: ''
		}
	},
	testConnection: function(id) {
		var self = this;
		var url = this.urlRoot;
		jQuery.post(url + "/test", {id: id}, function(response) {
			if(response) {
				self.trigger("testConnection:success", response);
			}
		}, "json").fail(function() {
			self.trigger("testConnection:error");
		});
	}
});