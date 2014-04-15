var include = require("includemvc");
var models = include.model("databases");
var Database = models.Database;

module.exports = exports = function(req, res, next) {
	var id = null;
	
	// find the id in the params or the body
	if(req.params.id) {
		id = req.params.id;
	}
	else {
		id = req.body.id;
	}

	Database.findOne({_id: id})
	.exec(function(err, result) {
		if(err) res.send(404);
		if(!result) res.send(404);
		if(result) {
			if(result.isLocked == false) {
				// database is unlocked, continue
				next();
			}
			else {
				res.send(403, "The database is locked. When a database is locked you can't make any changes to it or perform actions that may be dangerous. The only actions allowed are backups. If you still want to perform actions to this database, you need to unlock it first.")
			}
		}
		else {
			res.send(404);
		}
	});
}