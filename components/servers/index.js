var include = require("includemvc");
var app = include.app();
var isUser = include.lib("isUser", "users");
var isAdmin = include.lib("isAdmin", "users");

var controller = include.controller("servers");
var api = include("servers", "controllers", "api");

app.get("/servers", isUser, controller.getServers);

app.get("/api/servers", isUser, api.getServers);
app.post("/api/servers", isUser, isAdmin, api.postServer);

app.put("/api/servers/:id", isUser, isAdmin, api.putServer);
app.get("/api/servers/:id", isUser, api.getServer);
app.delete("/api/servers/:id", isUser, isAdmin, api.deleteServer);

/** 
 * Actions 
 */
app.post("/api/servers/test", isUser, isAdmin, api.postTestServer);