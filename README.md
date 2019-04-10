# Port Scanner 👁️

## Description
---

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
---

* [JQuery][jquery]
* [Bootstrap][bootstrap]
* [npm][npm]


## Install dependency
---

```
make install
```

Make sure [npm][npm] is installed. This command will install npm based
dependencies.


## Build
---

```
make build
```

Will create an `output` directory. Open the file `index.html` at your browser.


## Run
---

``make run```

It will run start the HTTP server on port `8080`. Make sure you have ran ```make
build``` to get output of latest code.


## License
---
[GPL v3][gpl_v3]


[js-recon]: http://blog.andlabs.org/2010/12/port-scanning-with-html5-and-js-recon.html
[gpl_v3]: https://www.gnu.org/licenses/gpl-3.0.en.html
[jquery]: https://jquery.com/
[bootstrap]: https://getbootstrap.com/
[npm]: https://www.npmjs.com/
