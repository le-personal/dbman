var include = require("includemvc");
var app = include.app();

var controller = include.controller("error");

app.get("/error", controller.error);
app.get("/404", controller.notFound);
app.get("/403", controller.accessDenied);