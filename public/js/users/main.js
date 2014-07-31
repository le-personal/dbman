require.config({
  paths : {
    backbone : '//cdnjs.cloudflare.com/ajax/libs/backbone.js/1.1.2/backbone-min',
    underscore : '//cdnjs.cloudflare.com/ajax/libs/underscore.js/1.6.0/underscore-min',
    jquery : '//cdnjs.cloudflare.com/ajax/libs/jquery/2.1.1/jquery.min',
    wreqr: '//cdnjs.cloudflare.com/ajax/libs/backbone.wreqr/0.1.0/backbone.wreqr.min',
    marionette : '//cdnjs.cloudflare.com/ajax/libs/backbone.marionette/2.0.3/backbone.marionette.min',
    bootstrap: "//cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/3.2.0/js/bootstrap.min",
    jqueryIframeTransport: "/vendor/jquery.iframe-transport/jquery.iframe-transport",
    backboneBootstrapModal: "/vendor/backbone.bootstrap-modal/src/backbone.bootstrap-modal",
    jqueryui: "//cdnjs.cloudflare.com/ajax/libs/jqueryui/1.10.4/jquery-ui.min"
  },
  shim : {
    jquery : {
      exports : 'jQuery'
    },
    underscore : {
      exports : '_'
    },
    backbone : {
      deps : ['jquery', 'underscore'],
      exports : 'Backbone'
    },
    wreqr: {
      deps: ["jquery", "underscore", "backbone"]
    },
    marionette : {
      deps : ['jquery', 'underscore', 'backbone', 'wreqr'],
      exports : 'Marionette'
    },
    bootstrap: {
      deps: ["jquery"],
      exports: "Bootstrap"
    },
    jqueryIframeTransport: {
      deps: ["jquery"],
    },
    backboneBootstrapModal: {
      deps: ["jquery", "backbone", "bootstrap"],
      exports: "BootstrapModal"
    },
    jqueryui: {
      deps: ["jquery"]
    }
  }
});

define(function (require) {
  var App = require("/js/app.js");
 
  var loading = require("/js/lib/loading.js");
  loading.hide();

  // Start Marionette Application in desktop mode (default)
  App.start();
});