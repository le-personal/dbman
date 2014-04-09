var include = require("includemvc");
var app = include.app();

var controller = include.controller("databases");

// app.get("/databases", controller.getDatabases);
// app.get("/databases/:id", controller.getDatabase);
// app.get("/databases/:id/export", controller.getExportDatabase);
// app.get("/databases/:id/backups", controller.getDatabaseBackups);
// app.get("/databases/:id/restore", controller.getDatabaseRestore);

app.get("/databases/create", controller.getCreateDatabase);
app.post("/databases/create", controller.postCreateDatabase);
app.get("/servers/:id/mysql", controller.listMySQLDatabases);