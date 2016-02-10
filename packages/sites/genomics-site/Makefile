PATH                := $(PROJECT_HOME)/WDK/View/node_modules/.bin:$(PATH)
SHELL               := /bin/bash

client_bundle  := dist/wdkCustomization/js/client.js
client_sources := webapp/wdkCustomization/js/client/main.js \
                  $(shell find webapp/wdkCustomization/js/client -type f -name '*.js' -or -name '*.jsx') \
                  webpack.config.js

es6_bundle  := dist/wdkCustomization/js/api.js
es6_sources := webapp/wdkCustomization/js/api.es6.js \
                  $(shell find webapp/wdkCustomization/js -type f -name '*.js' -or -name '*.jsx') \
                  webpack.config.js

.PHONY: all clean


## TODO Add CSS build tools

all: $(client_bundle) $(es6_bundle)

clean:
	rm $(client_bundle) $(es6_bundle)

$(es6_bundle): $(es6_sources)
	webpack $< $@
	rebaseSourceMap $@.map $$(readlink -f $(PROJECT_HOME)/WDK/View) .

$(client_bundle): $(client_sources)
	webpack $< $@
	rebaseSourceMap $@.map $$(readlink -f $(PROJECT_HOME)/WDK/View) .
