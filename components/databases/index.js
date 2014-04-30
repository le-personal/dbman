var include = require("includemvc");
var app = include.app();
var isUser = include.lib("isUser", "users");
var isAdmin = include.lib("isAdmin", "users");
var controller = include.controller("databases");
var api = include("databases", "controllers", "api");
var isUnlocked = include.lib("isUnlocked", "databases");
var canView = include.lib("canView", "databases");

app.get("/databases", isUser, controller.getDatabases);
app.get("/api/databases", isUser, api.getDatabases);
app.get("/api/databases/:id", isUser, canView, api.getDatabase);
app.post("/api/databases", isUser, isAdmin, api.postDatabase);
app.delete("/api/databases/:id", isUser, isAdmin, isUnlocked, api.deleteDatabase);

// actions
app.post("/api/databases/showdatabases", isUser, isAdmin, api.postShowDatabases);
app.post("/api/databases/showtables", isUser, isAdmin, api.postShowTables);
app.post("/api/databases/lock", isUser, isAdmin, isUnlocked, api.postLockDatabase);
app.post("/api/databases/unlock", isUser, isAdmin, api.postUnLockDatabase);
app.post("/api/databases/showusersindatabase", isUser, isAdmin, api.postShowUsersInDatabase);
app.post("/api/databases/import", isUser, isAdmin, isUnlocked, api.postImportDatabase);

app.post("/api/databases/permissions", isAdmin, api.postPermissions);

// users
app.get("/api/databases/users", isUser, isAdmin, api.getDatabaseUsers);
app.get("/api/databases/users/:id", isUser, isAdmin, api.getDatabaseUser);
app.post("/api/databases/users", isUser, isAdmin, api.postDatabaseUser);
app.delete("/api/databases/users/:id", isUser, isAdmin, api.deleteDatabaseUser);

app.get("/api/databases/backups", isUser, isAdmin, api.getBackups);
app.get("/api/databases/backups/:id", isUser, isAdmin, api.getBackup);
app.post("/api/databases/backups", isUser, isAdmin, api.postCreateBackup);
app.delete("/api/databases/backups/:id", isUser, isAdmin, api.deleteBackup);