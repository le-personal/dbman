var include = require("includemvc");
var app = include.app();
var isUser = include.lib("isUser", "users");
var isAdmin = include.lib("isAdmin", "users");
var controller = include.controller("databases");
var api = include("databases", "controllers", "api");
var isUnlocked = include.lib("isUnlocked", "databases");
var canView = include.lib("canView", "databases");
var canImport = include.lib("canImport", "databases");
var canEdit = include.lib("canEdit", "databases");
var canRemove = include.lib("canRemove", "databases");

app.get("/databases", isUser, controller.getDatabases);
app.get("/api/databases", isUser, api.getDatabases);
app.get("/api/databases/:id", isUser, canView, api.getDatabase);
app.post("/api/databases", isUser, isAdmin, api.postDatabase);
app.delete("/api/databases/:id", isUser, canRemove, isUnlocked, api.deleteDatabase);

// actions
app.post("/api/databases/showdatabases", isUser, isAdmin, api.postShowDatabases);
app.post("/api/databases/showtables", isUser, canView, api.postShowTables);
app.post("/api/databases/lock", isUser, canView, isUnlocked, api.postLockDatabase);
app.post("/api/databases/unlock", isUser, canView, api.postUnLockDatabase);
app.post("/api/databases/showusersindatabase", isUser, canView, api.postShowUsersInDatabase);
app.post("/api/databases/import", isUser, canImport, isUnlocked, api.postImportDatabase);

app.post("/api/databases/permissions", isAdmin, api.postPermissions);

// users
// no permissions here because we always need an id to check for permissions
app.get("/api/databases/users", isUser, api.getDatabaseUsers);
app.get("/api/databases/users/:id", isUser, canEdit, api.getDatabaseUser);
app.post("/api/databases/users", isUser, canEdit, api.postDatabaseUser);
app.delete("/api/databases/users/:id", isUser, canEdit, api.deleteDatabaseUser);

// no permissions here because we always need an id to check for permissions
app.get("/api/databases/backups", isUser, api.getBackups);
app.get("/api/databases/backups/:id", isUser, canView, api.getBackup);
// no permissions here because we always need an id to check for permissions
app.post("/api/databases/backups", isUser, api.postCreateBackup);
app.delete("/api/databases/backups/:id", isUser, canView, api.deleteBackup);