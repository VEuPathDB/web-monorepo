PATH          := $(PROJECT_HOME)/WDK/View/node_modules/.bin:$(PATH)
SHELL         := /bin/bash

apidb_bundle  := dist/apidb.build.js
# WDK and EuPathDB resources are included
apidb_sources := webapp/apidb.js \
                 $(shell find webapp -type f -name '*.js' -or -name '*.jsx' -or -name '*.css') \
                 $(shell find $(PROJECT_HOME)/WDK/View/webapp/wdk -type f) \
                 $(shell find $(PROJECT_HOME)/EuPathSiteCommon/Site/webapp -type f) \
                 $(PROJECT_HOME)/EuPathSiteCommon/Site/webpack.config.js

apidb_client_bundle    := dist/apidb-client.bundle.js
apidb_client_sources   := webapp/wdkCustomization/js/client/index.js \
                          $(shell find webapp -type f -name '*.js' -or -name '*.jsx' -or -name '*.css') \
                          $(shell find $(PROJECT_HOME)/WDK/View/webapp/wdk -type f) \
                          $(shell find $(PROJECT_HOME)/EuPathSiteCommon/Site/webapp -type f) \
                          $(PROJECT_HOME)/EuPathSiteCommon/Site/webpack.config.js

.PHONY: all clean yarn


## TODO Add CSS build tools

all: yarn $(apidb_bundle) $(apidb_client_bundle)

clean:
	rm -rf $(apidb_bundle) $(apidb_client_bundle)

yarn:
	yarn install

$(apidb_bundle): $(apidb_sources)
	webpack --config $(PROJECT_HOME)/EuPathSiteCommon/Site/webpack.config.js $< $@

$(apidb_client_bundle): $(apidb_client_sources)
	webpack --config $(PROJECT_HOME)/EuPathSiteCommon/Site/webpack.config.js $< $@
