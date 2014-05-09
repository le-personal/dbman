var include = require("includemvc");
var app = include.app();
var api = include.controller("files");
var isUser = include.lib("isUser", "users");
var isAdmin = include.lib("isAdmin", "users");
var config = app.config;
var directory = config.directory || "/tmp";

var multipart = require('connect-multiparty');
var multipartMiddleware = multipart();

// var fileupload = require('fileupload').createFileUpload("/home/luis/files").middleware;

app.get("/api/files", isUser, api.getFiles);
app.get("/api/files/:id", isUser, api.getFile);
app.post("/api/files", isUser, multipartMiddleware, api.postFile);


