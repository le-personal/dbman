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
	     
	      // $("div.newfile").text("File uploaded: " + newfile.filename);
	      
	      // the model is a file
	      Backbone.trigger("fileUploadedOK", {model: model});
	    };
	    
	    xhr.open('post', '/api/files', true);
	    xhr.send(formData);
		},

		importDatabase: function(fileModel) {
			loading.show();
			var self = this;

			var file = fileModel.toJSON();

			var db = this.options.model;

			db.importDatabase(file._id);

			db.on("importDatabase:success", function(response) {
				console.log("@todo implement success message here");
				loading.hide();
			})

			db.on("importDatabase:error", function(error) {
				// alert.error(error.responseText);
				console.log("@todo implement error here")
			})
		},

		// first check if there's a file.
		okClicked: function() {
			loading.show();
			var self = this;

			var fileId = self.fileId;
			var file = File({id: fileId});
			file.fetch({
				success: function(fileModel, response) {
					// call the import step
					self.importDatabase(fileModel);
					loading.hide();
				},
				error: function(model, response) {
					loading.hide();
				}	
			});

		}
	});

	return ImportView;
});