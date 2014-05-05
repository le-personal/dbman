define([
    "jquery"
	,	"backbone"
	, "marionette"
  , "underscore"
  , "/js/servers/view-viewTitle.js"
], function ($, Backbone, Marionette, _, ViewTitle) {
  var App = new Backbone.Marionette.Application();

  function isMobile() {
      var userAgent = navigator.userAgent || navigator.vendor || window.opera;
      return ((/iPhone|iPod|iPad|Android|BlackBerry|Opera Mini|IEMobile/).test(userAgent));
  }

  App.addRegions({
      titleRegion: "#title",
      headerRegion:"#header",
      mainRegion:"#main"
  });

  App.addInitializer(function () {
      Backbone.history.start();
  });

  // instantiate the view that shows the title and map it to App.title so
  // it's globally available in App
  // Also, add the new instantiated view to the titleRegion
  // whenever we need to change the title we must call the method set
  // Eg. App.title.set("Some title");
  App.title = new ViewTitle({title: ""});
  App.titleRegion.show(App.title);

  // This handles the show/hide of the loading animation
  // We do this with events so if we want to trigger them
  // we do: App.vent.trigger("hideLoading");
  App.vent.on("hideLoading", function() {
    $(".loading").hide();
  });

  App.vent.on("showLoading", function() {
    $(".loading").show();
  });

  App.mobile = isMobile();

  return App;
});