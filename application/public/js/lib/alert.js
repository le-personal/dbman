define(function(require) {
  var $ = require("jquery");
  var _ = require("underscore");
  var Backbone = require("backbone");
  var Marionette = require("marionette");
  var BootstrapModal = require("backboneBootstrapModal");

  var App = require("/js/app.js");
  var layout = require("/js/common/views/layout.js");

  var Alert = Backbone.Marionette.CompositeView.extend({
  	initialize: function() {
  		this.render();
  	},
  	render: function() {
  		switch(this.options.type) {
  			case "error":
		  		var message = '<div class="alert alert-danger">' +
		  			this.options.message +
		  			'</div>';
  			break;

  			case "warning":
		  		var message = '<div class="alert alert-warning">' +
		  			this.options.message +
		  			'</div>';
  			break;

  			case "success":
		  		var message = '<div class="alert alert-success">' +
		  			this.options.message +
		  			'</div>';
  			break;
  		}

			var modal = new Backbone.BootstrapModal({
        content: message,
        animate: true,
        allowCancel: false,
        okText: "Close",
        modalOptions: {
          backdrop: false,
        }
      });

      layout.modals.show(modal);
      modal.open();
  	}
  });


  var alert = {};
  alert.error = function(message) {
  	return new Alert({message: message, type: "error"});
  }

  alert.warning = function(message) {
  	return new Alert({message: message, type: "warning"});
  }

  alert.success = function(message) {
  	return new Alert({message: message, type: "success"});
  }

  return alert;
});