define([
  "jquery", 
  "underscore", 
  '/js/App.js', 
  'backbone', 
  'marionette', 
  '/js/servers/model.js',
  '/js/servers/view-viewServers.js', 
  '/js/servers/view-viewTitle.js', 
  '/js/servers/view-viewHeader.js',
  '/js/servers/view-showServer.js',
  "/js/servers/collection.js"
],
  function ($, _, App, Backbone, Marionette, Model, ViewServers, ViewTitle, ViewHeader, ShowServerView, Collection) {
  return Backbone.Marionette.Controller.extend({
      initialize:function (options) {
        // trigger the showLoading event
        App.vent.trigger("showLoading");

        App.session.load();
        App.session.on("sessionLoaded", function(user) {
          App.headerRegion.show(new ViewHeader({user: user}));
        });

        this.collection = new Collection();
        this.collection.reset();
      },

      //gets mapped to in AppRouter's appRoutes
      viewServers:function () {
        // Get the data from the template #data-servers
        var data = _.template($("#data-servers").html());

        // instantiate the collection and pass it to ViewServers    
        var collection = new Collection(JSON.parse(data()));

        var viewServers = new ViewServers({collection: collection});

        // show in the mainRegion the ViewServers view
        App.mainRegion.show(viewServers);

        // Set the title
        App.title.set("Servers");

        // trigger the hideLoading event
        App.vent.trigger("hideLoading");
      },
      showServerView: function(id) {
        var self = this;

        // Fetch the collection of servers
        this.collection.fetch({
          success: function(models, response) {
            // look for a model with the id defined
            var model = self.collection.get(id);

            // Set the name
            App.title.set(model.toJSON().name);

            // Stop the loading
            App.vent.trigger("hideLoading");

            // replace the main region with the ShowServerView and pass the model
            App.mainRegion.show(new ShowServerView({
              model: model
            }));
          }
        });
      },
      testConnection: function(id) {
        var self = this;
        this.collection.fetch({
          success: function(models, response) {
            var model = self.collection.get(id);
            model.testConnection();
            model.on("testConnection:success", function(data) {
              console.log(data);
             App.mainRegion.show(new DataView({
               stdout: data.stdout, 
               stderr: data.stderr
             }).render());
            });
          }
        });
      }
  });
});