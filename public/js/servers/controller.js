define(function (require) {
  var $ = require("jquery");
  var _ = require("underscore");
  var Backbone = require("backbone");
  var Marionette = require("marionette");
  var Model = require("/js/servers/model.js");
  var ViewServers = require("/js/servers/view-viewServers.js");
  var ShowServerView = require("/js/servers/view-showServer.js");
  var Collection = require("/js/servers/collection.js");
  var layout = require("/js/servers/view-layout.js");
  var loading = require("/js/servers/loading.js");
  var Title = require("/js/servers/view-viewTitle.js");
  var DataView = require("/js/servers/view-data.js");

  var Controller = Backbone.Marionette.Controller.extend({
    listenTo: {
      "showServerView": "showServerView",
      "testConnection": "testConnection"
    },
    initialize:function (options) {
      var self = this;
      this.collection = new Collection();
      this.collection.reset();

      // create a new title and add it to the title region in the layout
      // if we need to change the title we just do this.title.set("new title");
      this.title = new Title();
      layout.title.show(this.title);

      // listen to all events in this.listenTo and execute the value
      _.each(this.listenTo, function(index, value) {
        Backbone.on(index, function(options) {
          self[value](options);
        });
      });
    },
    router_viewServers: function() {
      this.viewServers();
    },
    router_showServerView: function(id) {
      loading.show();
      var self = this;

      // Fetch the collection of servers
      this.collection.fetch({
        success: function(models, response) {
          // look for a model with the id defined
          var model = self.collection.get(id);

          // this is firing twice, don't know if this has consecuences
          self.showServerView({model: model});
          loading.hide();
        }
      });
    },
    //gets mapped to in AppRouter's appRoutes
    viewServers:function () {
      // show loading
      loading.show();

      // Get the data from the template #data-servers
      var data = _.template($("#data-servers").html());

      // // instantiate the collection and pass it to ViewServers    
      var collection = new Collection(JSON.parse(data()));

      this.title.set("Servers");
      var viewServers = new ViewServers({collection: collection});

      // add the viewServers to the main region in the layout
      layout.main.show(viewServers);

      // hide loading
      loading.hide();
    },
    showServerView: function(options) {
      var self = this;
      self.title.set(options.model.toJSON().name);

      // replace the main region with the ShowServerView and pass the model
      layout.main.show(new ShowServerView({model: options.model}));
    },
    testConnection: function(options) {
      loading.show();
      var model = options.model;
      model.testConnection();
      model.on("testConnection:success", function(data) {
        loading.hide();
        layout.main.show(new DataView(data).render());
      });
    }
  });

  return Controller;
});