define(function (require) {
  var $ = require("jquery");
  var Backbone = require("backbone");
  var Marionette = require("marionette");
  var _ = require("underscore");
  var ViewTitle = require("/js/common/views/title.js");
  var Session = require("/js/lib/session.js");
  var Layout = require("/js/common/views/layout.js");
  var ViewHeader = require("/js/common/views/header.js");
 
  var App = new Backbone.Marionette.Application();
  
  // instantiate the session class
  App.session = new Session();

  App.addRegions({
    headerRegion: "#header",
    contentRegion: "#maincontent"
  });

  var layout = Layout;
  App.contentRegion.show(layout.render());

  App.session.load();
  App.session.on("sessionLoaded", function(user) {
    App.headerRegion.show(new ViewHeader({user: user}));
  });

  App.addInitializer(function () {   
    Backbone.history.start();
  });

  return App;
});