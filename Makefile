#### SYSTEM COMMAND ####
NPM=npm
GRUNT=grunt
BOWER=bower
GIT=git
CD=cd
ECHO=@echo
TAR=tar -zcvf
DEL=rm -rf

#### FOLDERS ####
NODE_DIR=node_modules
GRUNT_DEP=$(NODE_DIR)/grunt
DIST_DIR=dist
BOWER_DIR=client/bower_components

#### FILES ####
PACKAGE=dist.tar.gz

#### OTHER ####
ifneq ($(strip $(bower_registry)),)
BOWER_PARAM=--config.registry=$(bower_registry)
endif


##############
# MAIN TASKS #
##############

help:
	$(ECHO) "_____________________________"
	$(ECHO) "_____________________________"
	$(ECHO) " -- AVAILABLE TARGETS --"
	$(ECHO) "make clean                           => clean the sources"
	$(ECHO) "make install                         => install deps"
	$(ECHO) "make dev                             => launch the project (development)"
	$(ECHO) "make prod                            => launch the project (production) - For testing purpose only"
	$(ECHO) "make test                            => launch the tests"
	$(ECHO) "make build                           => build the project and generate build folder"
	$(ECHO) "make release type=patch|minor|major  => build the project, generate build folder, increment release and commit the source"
	$(ECHO) "_____________________________"

clean:
	$(DEL) $(NODE_DIR)
	$(DEL) $(BOWER_DIR)
	$(DEL) $(DIST_DIR)
	$(DEL) $(PACKAGE)

install:
	$(NPM) install
	$(BOWER) install $(BOWER_PARAM)

dev:
	$(GRUNT) serve

prod:
	$(GRUNT) serve:dist

test: $(GRUNT_DEP) $(BOWER_DIR)
	$(GRUNT) test

build: $(GRUNT_DEP) $(BOWER_DIR)
	$(GRUNT) build --cdsVersion=$(version)

release: commit-release build targz

#############
# SUB TASKS #
#############

$(NODE_DIR)/%: install
	# DO NOT DELETE - this comment is needed because make does not process this step
	# if there's no task def; seems to be related to the % suffix.

$(BOWER_DIR): install

update-release: $(GRUNT_DEP)
	$(GRUNT) release --type=$(type)

commit-release: update-release
	$(GRUNT) bump-commit

targz: $(DIST_DIR)
	$(TAR) $(PACKAGE) $(DIST_DIR)
