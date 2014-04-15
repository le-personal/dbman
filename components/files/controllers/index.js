var include = require("includemvc");
var app = include.app();
var File = include.model("files");
var fs = require("fs");
var directoryUploads = app.config.directoryUploads;
var path = require("path");
var Secure = include.lib("secure");
var secure = new Secure();

exports.postFile = function(req, res) {
	var file = req.files.file;

	if(file) {
		var extension = path.extname(file.path);
		if(extension == ".sql") {
			app.emit("file:uploading", {size: file.size});

			fs.open(file.path, 'r', function(err, result) {
				if(err) res.send(500, err);
				if(result) {

					var newPath = path.join(directoryUploads, secure.encrypt(new Date(Date.now()).toString()) + path.extname(file.path));
					var is = fs.createReadStream(file.path);
					var willBe = fs.createWriteStream(newPath);

					is.pipe(willBe);
					is.on("end", function() {
						fs.unlinkSync(file.path);

						var data = {
							filename: file.name,
							filepath: newPath,
							author: req.user,
							size: file.size,
							type: file.type,
							status: "permanent",
							extension: path.extname(file.path)
						}

						var model = new File(data);
						model.save(function(err, result) {
							if(err) {
								console.log(err);
								res.send(500, err);
							}
							if(result) {
								app.emit("file:finished", result);
								res.send(201, result);
							}
						});
					})
				}
			});
		}
		else {
			res.send(406, "The allowed extensions are tar, gz or sql");
		}
	}
}

exports.getFile = function(req, res) {
	var id = req.params.id;

	File.findOne({_id: id})
	.exec(function(err, result) {
		if(err) {
			res.send(404, err);
		}
		if(result) {
			res.send(200, result);
		}
	});
}

exports.getFiles = function(req, res) {
	File.find()
	.exec(function(err, results) {
		if(err) {
			res.send(500, err);
		}
		if(results) {
			res.send(200, results);
		}
	});
}
