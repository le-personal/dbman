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

require([
  "/js/App.js", 
  "/js/servers/router.js", 
  "/js/servers/controller.js", 
  "jquery", 
  "backbone", 
  "marionette", 
  "jqueryui", 
  "bootstrap"
], function (App, AppRouter, AppController) {
  App.appRouter = new AppRouter({
    controller: new AppController() // instantiate the controller with the mapped methods to the routes
  });

  // Start Marionette Application in desktop mode (default)
  App.start();
});