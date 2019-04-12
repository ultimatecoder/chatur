# Port Scanner 👁️

![License][badge_license]

![Docker][badge_docker]


## Description

Demonstrates possible way to identify services running at client workstation.
The tool makes request to range of ports to identify services running on that
port or not.


### Calculation on each port

1. Measure time before sending request to port.
2. Measure time took to send headers
3. Measure time took to send body
4. Calculate an average time took for sending headers and response body.
5. If the average response time is above or equal to 100 Microseconds, assume
   there is any service running on port.


The strategy is inspired from similar well-known tool [JS-Recon][js-recon].


## Dependencies

* [JQuery][jquery]
* [Bootstrap][bootstrap]
* [npm][npm]

### Testing (Optional)

* [Docker][docker]
* [Python][python]
* [Selenium][selenium]


## Install dependency

```
make install
```

Make sure [npm][npm] is installed. This command will install npm based
dependencies.


## Build


```
make build
```

Will create an `output` directory. Open the file `index.html` at your browser.


## Run


```
make run
```

It will run start the HTTP server on port `8080`. Make sure you have ran ```make
build``` to get output of latest code.


## Docker (Testing)

### Docker hub

```
docker run --rm --port 8080:8080 jaysinhp/javascript-port-scanner:latest
```

Above command will fetch the latest image from the [Docker hub][docker_repository]. You can access the tool at port `http://localhost:8080`. Make sure the port `8080` is empty.


## Lint

```
make javascript-lint
```

Will lint `source/assests/js/main.js` file against common Javascript
conventions.


### Local

```
make docker-build
```

It command will make the build of the docker image. Make sure [Docker][docker]
is installed.

```
make docker-run
```

It will start the container and bind on port `8080` of the host.


## End to End tests

Tests are written in [Selenium][selenium] wrapper of [Python][python].

### Build

Install [Pipenv][pipenv] tool to create virtual-environment. Locate to
`end-to-end-tests` directory. Make sure [Selenium][selenium] is installed.

```
pipenv shell
```
Use this command to activate virtual-environment prioer to running end to end
tests.

```
pipenv install
```

Run this command once to install all the Python dependencies.

```
make test-end-to-end
```

This command will run bunch of functional tests on the tool. Make sure the tool
is running at `http://localhost:8080`. You can find instrucions to run the tool.
You can override the target host and port values by creating environment
variables `TARGET_HOST` and `TARGET_PORT` respectively.


## License

[GPL v3][gpl_v3]


[js-recon]: http://blog.andlabs.org/2010/12/port-scanning-with-html5-and-js-recon.html
[gpl_v3]: https://www.gnu.org/licenses/gpl-3.0.en.html
[jquery]: https://jquery.com/
[bootstrap]: https://getbootstrap.com/
[npm]: https://www.npmjs.com/
[python]: https://www.python.org/
[selenium]: https://docs.seleniumhq.org/
[pipenv]: https://pypi.org/project/pipenv/
[badge_license]: https://img.shields.io/github/license/ultimatecoder/javascript_port_scanner.svg?style=plastic
[badge_docker]: https://dockeri.co/image/jaysinhp/javascript-port-scanner
[docker_repository]: https://hub.docker.com/r/jaysinhp/javascript-port-scanner
