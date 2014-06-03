var include = require("includemvc");
var controller = include.controller("installer");
var app = include.app();
var firstUserExists = include.lib("firstUserExists", "users");

app.get("/install", function(req, res) {
	res.redirect("/install/user");
});

app.get("/install/user", firstUserExists, controller.getCreateFirstUser);
app.post("/install/user", firstUserExists, controller.postCreateFirstUser);

app.get("/install/finish", controller.getFinish);