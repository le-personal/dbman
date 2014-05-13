# About the configuration file

The configuration is made through environment variables, only change the config.js 
file if you really have a good reason to do it, otherwise, it's recommended to 
set environment variables.

# Environment variables needed

- MONGODB_HOSTNAME // defaults to localhost
- MONGODB_DATABASE // defaults to dbman
- MONGODB_PORT // defaults to 27017

- REDIS_HOSTNAME // defaults to localhost
- REDIS_PORT // defaults to 6379

- PORT // application port, defaults to 3000