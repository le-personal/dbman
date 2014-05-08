define(function(require) {
	var Backbone = require("backbone");
	var Marionette = require("marionette");

	var DownloadBackupLinkView = Backbone.Marionette.CompositeView.extend({
		template: _.template($("#download-backup-link").html()),
		render: function() {
			this.$el.html(this.template({backup: this.options.model.toJSON()}));
			return this;
		}
	});

	return DownloadBackupLinkView;
});