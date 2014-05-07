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
  var MenuView = require("/js/servers/view-viewMenu.js");
  var BootstrapModal = require("backboneBootstrapModal");
  var AddServerFormView = require("/js/servers/view-addServerFormView.js")
  var io = require("/js/servers/io.js");

  var Controller = Backbone.Marionette.Controller.extend({
    listenTo: {
      "showServerView": "showServerView",
      "testConnection": "testConnection",
      "onClick:menu:add": "showAddServerForm",
      "showDeleteServerConfirmationForm": "showDeleteServerConfirmationForm"
    },
    initialize:function (options) {
      var self = this;

       // Get the data from the template #data-servers
      var data = _.template($("#data-servers").html());
      this.collection = new Collection(JSON.parse(data()));
      // this.collection.reset();

      // create a new title and add it to the title region in the layout
      // if we need to change the title we just do this.title.set("new title");
      this.title = new Title();
      layout.title.show(this.title);

      // listen to all events in this.listenTo and execute the value
      _.each(this.listenTo, function(value, index) {
        Backbone.on(index, function(options) {
          self[value](options);
        });
      });

      // start listening to all io events
      this.listenIO();
    },
    listenIO: function() {
      var self = this;
      // each time a new server is added and we detect the change
      // add it to the collection
      io.on("servers:added", function(model) {
        self.collection.add(model);
      });

      io.on("servers:removed", function(data) {
        console.log("listened to servers:removed");
        var model = new Model(data);
        console.log(model);
        self.collection.remove(model);
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
      this.title.set("Servers");
      
      // Set the menu
      layout.menu.show(new MenuView({title: "Add server", name: "add"}));

      // add the viewServers to the main region in the layout
      var viewServers = new ViewServers({collection: this.collection});
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
        var modal = new Backbone.BootstrapModal({
          title: "Testing connection to " + model.toJSON().name,
          content: new DataView(data).render(),
          animate: true
        });

        // Prevent zombie views by forcing the modal to be shown in #modals
        // and let Marionette handle the $el and closing
        layout.modals.show(modal);
        modal.open();
      });
    },
    showAddServerForm: function(options) {
      var addServerForm = new AddServerFormView({collection: this.collection});
      var modal = new Backbone.BootstrapModal({
        title: "Add server",
        content: addServerForm,
        animate: true
      });

      // Prevent zombie views by forcing the modal to be shown in #modals
      // and let Marionette handle the $el and closing
      layout.modals.show(modal);
      modal.open();
    },
    showDeleteServerConfirmationForm: function(options) {
      var self = this;
      var modal = new Backbone.BootstrapModal({
        title: "Are you sure you want to delete the server " + options.model.toJSON().name,
        content: "This action cannot be undone"
      });

      layout.modals.show(modal);
      modal.open();

      modal.on("ok", function() {
        loading.show();
        // destroy the model
        options.model.destroy({wait: true});
        loading.hide();
      });
    }
  });

  return Controller;
});