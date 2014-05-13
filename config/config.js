var config = {}

// Components enabled, do not change
config.components = ["users", "error", "servers", "databases", "files"];

// secret key, change it to encrypt your strings using this key
config.secretKey = "The monkey is on the tree";

// directory where you want to save the uploaded files, make sure the user 
// running the node process has permissions to write in this directory
config.directoryUploads = "/var/files";

// enable socket.io, do not disable unless you're having problems with it.
config.enableIO = true;

// mongodb configuration
config.mongodb = {
	hostname: process.env.MONGODB_HOSTNAME || "localhost",
	database: process.env.MONGODB_DATABASE || "dbman",
	port: process.env.MONGODB_PORT || "27017"
}

config.mongodburi = "mongodb://" + config.mongodb.hostname + ":" + config.mongodb.port + "/" + config.mongodb.database;

// redis configuration
config.redis = {
	host: process.env.REDIS_HOSTNAME || "localhost",
	port: process.env.REDIS_PORT || "6379"
}

config.port = process.env.PORT || "3000";

module.exports = config;
