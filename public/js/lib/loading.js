define(function(require) {
	var Loading = {
		show: function() {
			$(".loading").show();
		},
		hide: function() {
			$(".loading").hide();
		}
	}

	return Loading;
});