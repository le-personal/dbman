var include = require("includemvc");
var app = include.app();
var isUser = include.lib("isUser", "users");
var isAdmin = include.lib("isAdmin", "users");
var controller = include.controller("databases");

// app.get("/databases/:id/export", controller.getExportDatabase);
// app.get("/databases/:id/backups", controller.getDatabaseBackups);
// app.get("/databases/:id/restore", controller.getDatabaseRestore);

app.get("/databases", isUser, isAdmin, controller.getDatabases);
app.get("/databases/add", isUser, isAdmin, controller.getCreateDatabase);
app.post("/databases/add", isUser, isAdmin, controller.postCreateDatabase);


app.get("/databases/:id", controller.getDatabase);
app.get("/databases/:id/tables", controller.showTables);

app.get("/databases/:serverid/databases", isUser, isAdmin, controller.listMySQLDatabases);