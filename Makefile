install:
	npm install

run:
	./node_modules/.bin/http-server output

build:
	@echo "Building Javascript Port scanner at 'output' folder."
	mkdir -p output && cp -r source/assets output && cp source/html/index.html output/index.html

docker-build:
	docker build -t javascript_port_scanner:latest .

docker-run:
	docker run --rm -p 8080:8080 javascript_port_scanner
