require.config({
  paths : {
    backbone : '/vendor/backbone/backbone-min',
    underscore : '/vendor/underscore/underscore-min',
    jquery : '/vendor/jquery/dist/jquery.min',
    wreqr: '/vendor/backbone.wreqr/lib/backbone.wreqr.min',
    marionette : '/vendor/backbone.marionette/lib/backbone.marionette',
    bootstrap: "/vendor/bootstrap/dist/js/bootstrap.min",
    jqueryIframeTransport: "/vendor/jquery.iframe-transport/jquery.iframe-transport",
    backboneBootstrapModal: "/vendor/backbone.bootstrap-modal/src/backbone.bootstrap-modal",
    jqueryui: "/vendor/jquery-ui/ui/jquery-ui"
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
  var Router = require("/js/servers/routers/router.js");
  var Controller = require("/js/servers/controllers/controller.js");

  App.appRouter = new Router({
    controller: new Controller() // instantiate the controller with the mapped methods to the routes
  });

  // Start Marionette Application in desktop mode (default)
  App.start();
});