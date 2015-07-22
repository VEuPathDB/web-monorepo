PATH                := $(PROJECT_HOME)/WDK/View/node_modules/.bin:$(PATH)
SHELL               := /bin/bash

application_bundle  := dist/wdkCustomization/js/application.bundle.js
application_sources := webapp/wdkCustomization/js/application.js \
                       webapp/wdkCustomization/js/records/DatasetRecordClasses.DatasetRecordClass.js \
                       webapp/wdkCustomization/js/records/GeneRecordClasses.GeneRecordClass.js \
                       webpack.config.js


.PHONY: all clean


## TODO Add CSS build tools

all: $(application_bundle)

clean:
	rm $(application_bundle)

$(application_bundle): $(application_sources)
	webpack $< $@
	rebaseSourceMap $@.map $$(readlink -f $(PROJECT_HOME)/WDK/View) .
