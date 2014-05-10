define(function(require) {

	var Backbone = require("backbone");
	var Marionette = require("marionette");
	var loading = require("/js/lib/loading.js");

	var File = require("/js/databases/models/file.js");

	/**
	 * The destiny database is in the model my friend
	 */
	var ImportView = Backbone.Marionette.CompositeView.extend({
		template: _.template($("#import-database").html()),

		events: {
			"change .upload-button": "uploadButtonChanged"
		},

		initialize: function() {
			this.bind("ok", this.okClicked);
		},

		// this will render the model
		render: function() {
			// The target database comes in this.options.model
			this.$el.html(this.template({database: this.options.model.toJSON()}));
			return this;
		},

		// Private method to upload the progress bar
		_updateProgressBar: function(percentage) {
			var bar = $("#progress .bar");
			bar.css('width', percentage + '%').attr("aria-valuenow", percentage);
		},

		uploadButtonChanged: function(e) {
			e.preventDefault();

			var self = this;
			loading.show();

	  	var formData = new FormData();
	    var file = document.getElementById('file').files[0];
	    formData.append('file', file);

	    var xhr = new XMLHttpRequest();
	    
	    xhr.upload.onprogress = function(e) {
	      if (e.lengthComputable) {
	        var percentage = (e.loaded / e.total) * 100;
	        self._updateProgressBar(percentage);
	      }
	    };
	    
	    xhr.onerror = function(e) {
	    	console.log("@todo implement error");
	    	console.log("e.responseText");
	      loading.hide();
	    };
	    
	    xhr.onload = function() {
	    	self._updateProgressBar(100);
	      loading.hide();
	      
	      // Once the file is uploaded we have an id and we can create a new module and get it
	      // after that, we trigger the event informing the application to continue
	      var model = new File(JSON.parse(this.responseText));
	      $("span.fileinput-button").hide();
	     	      
	      // the model is a file
	      // we also pass the database model
	      Backbone.trigger("importFileUploadedOK", {file: model, database: self.options.model});
	    };
	    
	    xhr.open('post', '/api/files', true);
	    xhr.send(formData);
		}
	});

	return ImportView;
});