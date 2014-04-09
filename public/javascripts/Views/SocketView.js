App.Views.SocketView = Backbone.View.extend({
	initialize: function(data) {
		this.databaseId = data.id;
		this.listen(data.id);
	},
	listen: function(id) {
		console.log(id);
		var self = this;
		// not working
		App.io.on("test", function(data) {
			console.log(data);
			self.render();
		});
	},
	render: function() {
		console.log("rendering");
	}
});