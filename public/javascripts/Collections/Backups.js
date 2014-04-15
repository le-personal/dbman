App.Collections.Backups = Backbone.Collection.extend({
	model: App.Models.Backup,
	url: "/api/databases/backups"
});