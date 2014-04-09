var App = App || {}
App.Routers = {}
App.Views = {}
App.Collections = {}
App.Models = {}
App.Controller = function(id) {
	this.id = id;
}
App.io = io.connect();
