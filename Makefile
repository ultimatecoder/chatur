build:
	@echo "Building Javascript Port scanner at 'output' folder."
	mkdir -p output && cp -r source/assets output && cp source/html/index.html output/index.html
