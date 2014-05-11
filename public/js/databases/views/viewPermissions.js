define(function(require) {
	var Backbone = require("backbone");
	var Marionette = require("marionette");

	var ViewPermissionsRow = Backbone.Marionette.ItemView.extend({
		tagName: "tr",
		template: _.template($("#permission-view-row").html()),
		events: {
			"click a.revoke-access-btn": "revokeAccess"
		},
		initialize: function(options) {
			var self = this;
			this.options = options;

			this.collection.on("reset", function() {
				console.log("Reseted");
				self.render();
			}, this);
		},
		render: function() {
			this.$el.html(this.template({permission: this.options.permission, user: this.options.model}));
			return this;
		},
		revokeAccess: function(e) {
			e.preventDefault();
			var self = this;

			var userid = this.model._id;
			var permission = $(e.currentTarget).attr("data-permission");
			var database = this.options.database;
			var id = database._id;

			database.removePermission(userid, permission);

			database.on("removePermission:success", function(response) {
				self.collection.reset();
			})
		}
	});

	var ViewPermissions = Backbone.Marionette.CompositeView.extend({
		template: _.template($("#permissions-view").html()),
		initialize: function() {
			var self = this;
			this.model.on("change", function() {
				self.collection.reset();
			}, this);
			
			self.collection.on("reset", function() {
				self.collection.fetch({
					success: function(models) {
						var model = self.collection.get(self.model.toJSON()._id);
						
						Backbone.trigger("viewPermissions", {collection: self.collection, model: model});
					}
				});
			}, this);
		},
		render: function() {
			var self = this;
			
			self.$el.append(self.template());

			var database = this.options.model.toJSON();

			// for each permission add the right template with the right data
			_.each(database.permissions.view, function(data) {
				self.$("#membersWithViewAccess").append(new ViewPermissionsRow({
					collection: self.options.collection,
					database: self.options.model, 
					permission: "view", 
					model: data
				}).render().el);
			});

			_.each(database.permissions.edit, function(data) {
				self.$("#membersWithEditAccess").append(new ViewPermissionsRow({
					collection: self.options.collection,
					database: self.options.model, 
					permission: "edit", 
					model: data
				}).render().el);
			});

			_.each(database.permissions.import, function(data) {
				self.$("#membersWithImportAccess").append(new ViewPermissionsRow({
					collection: self.options.collection,
					database: self.options.model, 
					permission: "import", 
					model: data
				}).render().el);
			});

			_.each(database.permissions.remove, function(data) {
				self.$("#membersWithRemoveAccess").append(new ViewPermissionsRow({
					collection: self.options.collection,
					database: self.options.model, 
					permission: "remove", 
					model: data
				}).render().el);
			});

			return this;
		}
	});

	return ViewPermissions;
});