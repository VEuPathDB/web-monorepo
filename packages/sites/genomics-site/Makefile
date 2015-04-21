PATH                := $(PROJECT_HOME)/WDK/View/node_modules/.bin:$(PATH)
application_bundle  := $(BASE_GUS)/webapp/wdkCustomization/js/application.bundle.js
application_sources := webapp/wdkCustomization/js/application.js


.PHONY: all clean


all: $(application_bundle)

clean:
	rm $(application_bundle)

$(application_bundle): $(application_sources)
	webpack $< $@
	rebaseSourceMap $@.map $$(readlink -f $(PROJECT_HOME)/WDK/View) .
