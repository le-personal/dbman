# About the configuration file

The configuration is made through environment variables, only change the config.js 
file if you really have a good reason to do it, otherwise, it's recommended to 
set environment variables.

# Environment variables needed

- MONGODB_PORT_27017_TCP_ADDR // defaults to localhost
- MONGODB_DATABASE // defaults to dbman
- MONGODB_PORT_27017_TCP_PORT // defaults to 27017

- REDIS_PORT_6379_TCP_ADDR // defaults to localhost
- REDIS_PORT_6379_TCP_PORT // defaults to 6379

- PORT // application port, defaults to 3000