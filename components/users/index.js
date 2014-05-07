var include = require("includemvc");
var app = include.app();
var controller = include.controller("users")
var firstUserExists = include.lib("firstUserExists", "users");
var isUser = include.lib("isUser", "users");
var isNotUser = include.lib("isNotUser", "users");
var isAdmin = include.lib("isAdmin", "users");

app.get("/", function(req, res, next) {
	if(!req.user) {
		res.redirect("/login");
	}
	else {
		res.redirect("/databases");
	}
})

app.get("/login", isNotUser, controller.getLogin);
app.post("/login", isNotUser, controller.postLogin());

app.get("/logout", controller.getLogout);

app.get("/register", controller.getRegister);
app.post("/register", controller.postRegister);

app.get("/password", controller.getPassword);
app.post("/password", controller.postPassword);

app.get("/settings", isUser, controller.getSettings);
app.post("/settings", isUser, controller.postSettings);
app.get("/settings/password", isUser, controller.getSettingsPassword);
app.post("/settings/password", isUser, controller.postSettingsPassword);

app.get("/admin/users", isUser, isAdmin, controller.getAdminUsers);
app.get("/admin/users/create", isUser, isAdmin, controller.getAdminCreateUser);
app.post("/admin/users/create", isUser, isAdmin, controller.postAdminCreateUser);

app.get("/admin/users/edit/:id", isUser, isAdmin, controller.getAdminEditUser);
app.post("/admin/users/edit/:id", isUser, isAdmin, controller.postAdminEditUser);

app.get("/admin/users/delete/:id", isUser, isAdmin, controller.getAdminDeleteUser);
app.post("/admin/users/delete/:id", isUser, isAdmin, controller.postAdminDeleteUser);

app.get("/api/users", isUser, controller.apiGetUsers);

app.get("/api/session", isUser, controller.apiGetSession);