App.Views.ViewServer = Backbone.View.extend({
	template: _.template($("#viewServerTemplate").html()),
	id: null,
	initialize: function(data) {
		this.id = data.id;
		
		// render the view
		this.render();
	},
	render: function() {
		var self = this;
		
		this.model = new App.Models.Server({id: this.id});
		this.model.fetch({
			success: function(model) {
				var server = model.toJSON();
				self.$el.html(self.template({server: server}));
			}
		});
	}
});

App.Views.AddServer = Backbone.View.extend({
	template: _.template($("#addServerTemplate").html()),
	events: {
		"click .submit": "save"
	},
	initialize: function() {
		this.render();
		this.changeTitle();
		this.changeActiveMenu();


	},
	changeTitle: function() {
		$("h1").text("Add server");
	},
	changeActiveMenu: function() {
		$("ul.nav > li.active").removeClass("active");
		$("ul.nav > li.add").addClass("active");
	},
	render: function() {
		this.$el.html(this.template());
	},
	save: function(e) {
		e.preventDefault();
		var self = this;

		var data = {
			name: $('input[name="name"]').val(),
			ip: $('input[name="ip"]').val(),
			ssh_username: $('input[name="ssh_username"]').val(),
			ssh_keypath: $('input[name="ssh_keypath"]').val(),
			ssh_port: $('input[name="ssh_port"]').val(),
			os: $('select[name="os"]').val(),
			service: {
				type: $('select[name="service[type]"]').val(),
				username: $('input[name="service[username]"]').val(),
				password: $('input[name="service[password]"]').val(),
				port: $('input[name="service[port]"]').val(),
			}
		}

		var model = new App.Models.Server();
		model.save(data, {
			success: function() {				
				new App.Views.Message({type: "success", message: "Created"});
			},
			error: function(model, response, xhr) {
				new App.Views.Message({type: "danger", message: response.responseText});
				// app.navigate("/");
			}
		});
	}
});

App.Views.EditServer = Backbone.View.extend({

});