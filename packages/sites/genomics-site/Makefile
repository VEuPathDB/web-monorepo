PATH                := $(PROJECT_HOME)/WDK/View/node_modules/.bin:$(PATH)
wdk_bundle          := $(WEBAPP)/wdk/js/wdk-3.0.js
application_bundle  := dist/wdkCustomization/js/application.bundle.js
application_sources := webapp/wdkCustomization/js/application.js


.PHONY: all clean


## TODO Add CSS build tools

all: $(application_bundle)

clean:
	rm $(application_bundle)

$(application_bundle): $(application_sources) $(wdk_bundle)
	webpack $< $@
	rebaseSourceMap $@.map $$(readlink -f $(PROJECT_HOME)/WDK/View) .
