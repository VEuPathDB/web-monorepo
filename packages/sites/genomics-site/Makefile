PATH                := $(PROJECT_HOME)/WDK/View/node_modules/.bin:$(PATH)
SHELL               := /bin/bash

apidb_bundle  := dist/apidb.build.js
apidb_sources := webapp/apidb.js \
  $(shell find webapp -type f -name '*.js' -or -name '*.jsx') \
  webpack.config.js

.PHONY: all clean


## TODO Add CSS build tools

all: $(apidb_bundle)

clean:
	rm -rf $(apidb_bundle)

$(apidb_bundle): $(apidb_sources)
	webpack $< $@
