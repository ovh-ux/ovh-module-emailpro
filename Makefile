#### SYSTEM COMMAND ####
NODE=node
NPM=npm
GRUNT=grunt
BOWER=bower
GIT=git
CD=cd
ECHO=@echo
TAR=tar -czf
DEL=rm -rf
MAKE=make
MV=mv
RSYNC=rsync -av --delete --exclude=".git"

#### FOLDERS ####
BOWER_DIR=bower_components
NODE_DIR=node_modules
GRUNT_DEP=$(NODE_DIR)/grunt

#### MACRO ####
NAME=`grep -Po '(?<="name": ")[^"]*' package.json`
VERSION=`grep -Po '(?<="version": ")[^"]*' package.json`

#### OTHER ####
ifneq ($(strip $(bower_registry)),)
BOWER_PARAM=--config.registry=$(bower_registry)
endif

#########
# Tasks #
#########

help:
	$(ECHO) "_____________________________"
	$(ECHO) "$(NAME)"
	$(ECHO) "Version $(VERSION)"
	$(ECHO) "Copyright (c) OVH SAS."
	$(ECHO) "All rights reserved."
	$(ECHO) "_____________________________"
	$(ECHO) " -- AVAILABLE TARGETS --"
	$(ECHO) "make version                                      => get the current version"
	$(ECHO) "make clean                                        => clean the sources"
	$(ECHO) "make install                                      => install deps"
	$(ECHO) "make dev                                          => launch the project (development)"
	$(ECHO) "make test                                         => launch the tests"
	$(ECHO) "make build                                        => build the project and generate dist"
	$(ECHO) "make release type=major|minor|patch|prerelease    => build the project, generate build folder, increment release and commit the dist"
	$(ECHO) "_____________________________"

version:
	$(ECHO) $(VERSION)

clean:
	$(DEL) $(NODE_DIR)
	$(DEL) $(BOWER_DIR)

install:
	$(NPM) install
	$(BOWER) install $(BOWER_PARAM)

dev: deps
	$(GRUNT) build --mode=dev
	$(GRUNT) watch

build: deps
	$(GRUNT) build --mode=prod

release: update-release build commit-release


###############
# Tests tasks #
###############

test: deps
	$(GRUNT) test


#############
# Sub tasks #
#############

# Dependencies of the project
deps: $(GRUNT_DEP) $(BOWER_DIR)

$(BOWER_DIR):
	$(MAKE) install

$(NODE_DIR)/%:
	$(MAKE) install

clean-dist: deps
	$(GRUNT) clean

update-release: deps
	$(GRUNT) release --type=$(type)

commit-release: deps
	$(GRUNT) bump-commit
