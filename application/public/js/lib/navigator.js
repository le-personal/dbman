define(function(require) {
	function Navigator() {

	}

	Navigator.prototype.to = function(fragment, id, reload) {
		this.reload = reload ? reload : false;
		Backbone.history.navigate("#" + fragment + "/" + id, {trigger: this.reload});
	}

	Navigator.prototype.toPath = function(path, reload) {
		this.reload = reload ? reload : false;
		Backbone.history.navigate(path, {trigger: this.reload});
	}

	return new Navigator();
});