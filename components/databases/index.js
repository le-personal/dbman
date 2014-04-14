var include = require("includemvc");
var app = include.app();
var isUser = include.lib("isUser", "users");
var isAdmin = include.lib("isAdmin", "users");
var controller = include.controller("databases");
var api = include("databases", "controllers", "api");
var isUnlocked = include.lib("isUnlocked", "databases");

app.get("/databases", isUser, isAdmin, controller.getDatabases);
app.get("/api/databases", isUser, isAdmin, api.getDatabases);
app.get("/api/databases/:id", isUser, isAdmin, api.getDatabase);
app.post("/api/databases", isUser, isAdmin, api.postDatabase);

app.delete("/api/databases/:id", isUser, isAdmin, isUnlocked, api.deleteDatabase);

app.post("/api/databases/showdatabases", isUser, isAdmin, api.postShowDatabases);
app.post("/api/databases/showtables", isUser, isAdmin, api.postShowTables);
app.post("/api/databases/lock", isUser, isAdmin, isUnlocked, api.postLockDatabase);
app.post("/api/databases/unlock", isUser, isAdmin, api.postUnLockDatabase);
app.post("/api/databases/showusersindatabase", isUser, isAdmin, api.postShowUsersInDatabase);

app.get("/api/databases/users", isUser, isAdmin, api.getDatabaseUsers);
app.get("/api/databases/users/:id", isUser, isAdmin, api.getDatabaseUser);
app.post("/api/databases/users", isUser, isAdmin, api.postDatabaseUser);
app.delete("/api/databases/users/:id", isUser, isAdmin, api.deleteDatabaseUser);

// app.get("/databases/add", isUser, isAdmin, controller.getCreateDatabase);
// app.post("/databases/add", isUser, isAdmin, controller.postCreateDatabase);


// app.get("/databases/:id", controller.getDatabase);
// app.get("/api/databases/:id/tables", controller.showTables);

// app.get("/databases/:serverid/databases", isUser, isAdmin, controller.listMySQLDatabases);