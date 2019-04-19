install:
	cd chatur && npm install

run:
	cd chatur && ./node_modules/.bin/http-server output

build:
	@echo "Building Javascript Port scanner at 'output' folder."
	cd chatur && mkdir -p output && cp -r source/assets output && cp source/html/index.html output/index.html

docker-build:
	docker build -t chatur:latest chatur

docker-run:
	docker run --rm -p 8080:8080 chatur

test-end-to-end:
	cd end-to-end-tests && nosetests

javascript-lint:
	cd chatur && ./node_modules/.bin/eslint -c configurations/.eslintrc.yml source/assets/js/main.js

html-lint:
	cd chatur && ./node_modules/.bin/html-validate source/html/*.html
