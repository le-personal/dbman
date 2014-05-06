define(function(require) {
	var Backbone = require("backbone");
	var Wreqr = require("wreqr");
	var vent = new Backbone.Wreqr.EventAggregator(); 

	return vent;
})