install:
	cd javascript_port_scanner && npm install

run:
	cd javascript_port_scanner && ./node_modules/.bin/http-server output

build:
	@echo "Building Javascript Port scanner at 'output' folder."
	cd javascript_port_scanner && mkdir -p output && cp -r source/assets output && cp source/html/index.html output/index.html

docker-build:
	docker build -t javascript_port_scanner:latest javascript_port_scanner

docker-run:
	docker run --rm -p 8080:8080 javascript_port_scanner

test-end-to-end:
	cd end-to-end-tests && nosetests

javascript-lint:
	cd javascript_port_scanner && ./node_modules/.bin/eslint -c configurations/.eslintrc.yml source/assets/js/main.js

html-lint:
	cd javascript_port_scanner && ./node_modules/.bin/html-validate source/html/*.html
