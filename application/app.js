/**
 * @file exposes the app object instantiated so other components and files can
 * require it and share events across the entire application
 */

var express = require("express");
var include = require("includemvc");
var config = include.path("config", "config.js");
var app = module.exports = exports = express();
var path = require("path");
var mvc = require("expressjsmvc");
var flash = require("express-flash");
var passport = require("passport");

var RedisStore = require('connect-redis')(express);
var redisOptions = config.redis;

// Alloy all configuration to be available in app.config
app.config = config;

// all environments
mvc.EnableMultipeViewsFolders(app);
app.set('port', config.port);
app.set('views', [path.join(__dirname, 'views')]);
app.set('view engine', 'jade');
app.locals.basedir = path.join(__dirname, 'views');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(express.cookieParser(config.secretKey));
app.use(express.session({ 
	store: new RedisStore(redisOptions),
	secret: config.secretKey,
	cookie: { 
		expires: new Date(Date.now() + 3600000),
		maxAge: 3600000
	}
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

app.use(function(req, res, next) {
	res.locals.user = req.user;
	res.locals.isUser = req.user ? true : false;
	next();
})

app.use(app.router);

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(user, done) {
  done(null, user);
});


/** 
 * Autodetect all views in components 
 */
var components = config.components;
components.forEach(function(component) {
	mvc.addView(app, path.join(__dirname, "components", component));
});

console.log(app.get("env"));
// development only
if ('development' == app.get('env')) {
	console.log("On development");
	app.use(express.static(path.join(__dirname, '/public')));
	app.use(express.errorHandler());
}

