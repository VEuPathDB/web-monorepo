.PHONY: default
default:
	@echo 'Usage:'
	@echo '    make docker-build'
	@echo '        Builds the client docker image'
	@echo '    make docker-run'
	@echo '        Runs the client docker image, exposing the resources on localhost:8082'

docker-build:
	@docker build -t veupathdb/client-server .

docker-run:
	@docker run -it --rm -p 80:80 veupathdb/client-server

