define([
  "jquery", 
  "underscore", 
  '/js/App.js', 
  'backbone', 
  'marionette', 
  '/js/servers/view-viewServers.js', 
  '/js/servers/view-viewTitle.js', 
  "/js/servers/collection.js"
],
  function ($, _, App, Backbone, Marionette, ViewServers, ViewTitle, Collection) {
  return Backbone.Marionette.Controller.extend({
      initialize:function (options) {
        // trigger the showLoading event
        App.vent.trigger("showLoading");
        
         //  App.headerRegion.show(new DesktopHeaderView());
      },
      //gets mapped to in AppRouter's appRoutes
      viewServers:function () {
        // Get the data from the template #data-servers
        var data = _.template($("#data-servers").html());

        // instantiate the collection and pass it to ViewServers    
        var collection = new Collection(JSON.parse(data()));

        // show in the mainRegion the ViewServers view
        App.mainRegion.show(new ViewServers({collection: collection}));

        // Set the title
        App.title.set("Servers");

        // trigger the hideLoading event
        App.vent.trigger("hideLoading");
      }
  });
});