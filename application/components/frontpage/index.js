var include = require("includemvc");
var app = include.app();
var controller = include.controller("frontpage")

app.get("/", controller.frontpage);
