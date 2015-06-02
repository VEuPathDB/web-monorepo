PATH                := $(PROJECT_HOME)/WDK/View/node_modules/.bin:$(PATH)
SHELL               := /bin/bash

wdk3_bundle          := $(PROJECT_HOME)/WDK/View/dist/wdk/js/wdk-3.0.js

application_bundle  := dist/wdkCustomization/js/application.bundle.js
application_sources := webapp/wdkCustomization/js/application.js \
                       webapp/wdkCustomization/js/records/DatasetRecordClasses.DatasetRecordClass.js \
                       $(wdk3_bundle)


.PHONY: all clean


## TODO Add CSS build tools

all: $(application_bundle)

clean:
	rm $(application_bundle)

$(application_bundle): $(application_sources)
	webpack $< $@
	rebaseSourceMap $@.map $$(readlink -f $(PROJECT_HOME)/WDK/View) .
