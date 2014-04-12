var include = require("includemvc");
var app = include.app();
var isUser = include.lib("isUser", "users");
var isAdmin = include.lib("isAdmin", "users");

var controller = include.controller("servers");

app.get("/api/servers/:id", isUser, controller.getAPIServer);
app.get("/api/servers", isUser, controller.getAPIServers);
app.post("/api/servers", isUser, isAdmin, controller.postAPIAddServer);
app.post("/api/servers/test", isUser, isAdmin, controller.postTestServer);




app.get("/servers", isUser, controller.getServers);



app.get("/servers/:id/edit", isUser, isAdmin, controller.getEditServer);
app.post("/servers/:id/edit", isUser, isAdmin, controller.postEditServer);

app.get("/servers/:id/delete", isUser, isAdmin, controller.getDeleteServer);
app.post("/servers/:id/delete", isUser, isAdmin, controller.postDeleteServer);
