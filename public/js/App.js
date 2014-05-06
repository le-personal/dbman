define(function (require) {
  var $ = require("jquery");
  var Backbone = require("backbone");
  var Marionette = require("marionette");
  var _ = require("underscore");
  var ViewTitle = require("/js/servers/view-viewTitle.js");
  var Session = require("/js/servers/session.js");
  var Layout = require("/js/servers/view-layout.js");
  var ViewHeader = require("/js/servers/view-viewHeader.js");
 

  var App = new Backbone.Marionette.Application();

  function isMobile() {
      var userAgent = navigator.userAgent || navigator.vendor || window.opera;
      return ((/iPhone|iPod|iPad|Android|BlackBerry|Opera Mini|IEMobile/).test(userAgent));
  }
  
  // // instantiate the session class
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

  // // instantiate the view that shows the title and map it to App.title so
  // // it's globally available in App
  // // Also, add the new instantiated view to the titleRegion
  // // whenever we need to change the title we must call the method set
  // // Eg. App.title.set("Some title");
  // App.title = new ViewTitle({title: ""});
  // App.titleRegion.show(App.title);

  // App.navigate = function(fragment, id) { 
  //   Backbone.history.navigate(fragment + "/" + id, {trigger: true});
  // }

  return App;
});