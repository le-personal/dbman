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
});