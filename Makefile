CURRENT_DIRECTORY := $(shell pwd)
CURRENT_USER := $(shell whoami)
install:
	@cd $(CURRENT_DIRECTORY)/application ; npm install	

up:
	@fig up -d

clean:
	@fig stop

start:
	@fig start web
	@tail -f /var/log/docker/dbman/nodejs.log

stop:
	@fig stop web

status:
	@fig ps

cli:
	@fig run --rm web bash

log:
	@tail -f /var/log/docker/dbman/nodejs.log

restart:
	@fig stop web
	@fig start web
	@tail -f /var/log/docker/dbman/nodejs.log

.PHONY: install up clean start stop status cli log restart
