var include = require("includemvc");
var app = include.app();
var isUser = include.lib("isUser", "users");
var isAdmin = include.lib("isAdmin", "users");

var controller = include.controller("servers");

app.get("/servers", isUser, controller.getServers);

app.get("/servers/add", isUser, isAdmin, controller.getAddServer);
app.post("/servers/add", isUser, isAdmin, controller.postAddServer);

app.get("/servers/:id", isUser, controller.getServer);

app.get("/servers/:id/edit", isUser, isAdmin, controller.getEditServer);
app.post("/servers/:id/edit", isUser, isAdmin, controller.postEditServer);

app.get("/servers/:id/delete", isUser, isAdmin, controller.getDeleteServer);
app.post("/servers/:id/delete", isUser, isAdmin, controller.postDeleteServer);

app.get("/servers/:id/test", isUser, isAdmin, controller.getTestServer);