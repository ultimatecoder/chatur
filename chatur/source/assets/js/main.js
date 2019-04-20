/*
 * main.js
 * Copyright (C) 2019 jay <jay@altair>
 *
 * Source of TCP IP service list: https://www.iana.org/assignments/service-names-port-numbers/service-names-port-numbers.xhtml
 */
$(document).ready(function() {
  var results = {};
  var TCPlist = null;
  var portFileLoaded = false;
  var interval = null;
  var scanRunning = false;
  var btnDiscover = $("#btn-discover");
  var concurrentRequests = 6;
  var iteration = 100;  // Works nearly to expected

  var sum = function(arr) {
    var result = 0;
    for (i=0; i<arr.length; i++) {
      result += arr[i];
    }
    return result;
  };

  var powerArr = function(arr) {
    var result = [];
    for (i=0; i<arr.length; i++) {
      result.push(Math.pow(arr[i], 2));
    }
    return result;
  };

  var mean = function(arr) {
    return (sum(arr) / arr.length);
  };

  var variance = function(arr) {
    _mean = mean(arr);
    var variances = [];
    for (i=0; i<arr.length; i++) {
      variances.push(arr[i] - _mean);
    };
    return sum(powerArr(variances)) / (arr.length - 1);
  };

  var standardDeviation = function(arr) {
    return Math.sqrt(variance(arr));
  };

  var requestPort = function(port) {
    var deferred = $.Deferred();
    var xhr = new XMLHttpRequest();
    var startTime = null;
    var responseTime = {};

    xhr.onreadystatechange = function () {
      if (xhr.readyState === 2) {
        responseTime["header"] = Date.now() - startTime;
        deferred.resolve(responseTime);
      }
    };

    startTime =  Date.now();
    xhr.open('GET', "http://127.0.0.1:" + port, true);
    xhr.send();
    return deferred;
  };

  var burst = function(port, concurrentRequests) {
    var deferred = $.Deferred();
    var pendingResponses = 0;
    var responseTimeCollection = {
      "header": [],
    };

    for (i=0; i<concurrentRequests; i++) {
      requestPort(port).done(function(result) {
        responseTimeCollection["header"].push(result["header"]);
      }).done(function() {
        pendingResponses ++;
        if (pendingResponses == concurrentRequests) {
          deferred.resolve(responseTimeCollection);
        }
      });
    };
    return deferred;
  };

  var sniff = function(port) {
    var deferred = $.Deferred();
    var intervals = 10 // In Micro secounds;
    var pending = 0;
    var responseTimeCollectionByIteration = {
      "header": [],
    };
    var requestPending = false;

    var intervalObj = setInterval(function() {
      if (! requestPending) {
        requestPending = true;
        burst(port, concurrentRequests=6).done(function(result) {
          responseTimeCollectionByIteration["header"] = responseTimeCollectionByIteration["header"].concat(result["header"]);
        }).done(function() {
          pending++;
          if (pending == iteration) {
            clearInterval(intervalObj);
            deferred.resolve(responseTimeCollectionByIteration);
          };
        }).done(function() {
          requestPending = false;
        });
      }
    }, interval);
    return deferred;
  };

  var isSuspectedPort = function(averageResponseTime, standardDeviation) {
    if (
      (averageResponseTime["header"] > standardDeviation["header"])
    ) {
      return true;
    } else {
      return false;
    }
  };

  var filterSuspectedPorts = function(ports, standardDeviation) {
    var results = [];
    for (var port of Object.keys(ports)) {
      if (isSuspectedPort(ports[port], standardDeviation)) {
        results.push(port);
      }
    }
    return results;
  };

  var sendRequest = function(port) {
    var deferred = $.Deferred();
    var responseTime = {
      "headerTime": {},
    };

    for (i=0; i<concurrentRequests; i++) {
      requestPort(port, i, responseTime, deferred, concurrentRequests);
    };

    return deferred;
  };

  var constructPortDescription = function(port) {
    var row = $("<tr></tr>");
    dataPort = $("<td></td>").text(port);
    if (!(port in TCPlist)) {
      description = "Unknown";
    } else {
      description = TCPlist[port];
    }
    dataDescription = $("<td></td>").text(description);
    row.append(dataPort);
    row.append(dataDescription);
    return row
  };

  var readPortsFile = function(location) {
    return $.getJSON(location, function(result) {
      TCPlist = result;
    });
  };

  readPortsFile("assets/data/tcp_ports.json").done(function(result){
    portFileLoaded = true;
  });

  $("#btn-discover").on("click", function(event) {
    if ($("#btn-discover").hasClass("btn-primary")) {
      $("#btn-discover").text("Stop").removeClass("btn-primary").addClass("btn-danger");
      $("#status").text("Scanning").removeClass("badge-secondary").addClass("badge-success");
    } else {
      $("#btn-discover").text("Discover").removeClass("btn-danger").addClass("btn-primary");
      $("#status").text("Finished").removeClass("badge-success").addClass("badge-secondary");
    }
  });

  var headerResponseTime = function(startTime, responseTime) {
    return responseTime - startTime;
  };

  $("#port-form").submit(function(event) {
    if (portFileLoaded) {
      var startPort = parseInt($("#start-port").val());
      var endPort = parseInt($("#end-port").val());
      var port = startPort;
      var requestInProgress = false;
      var interval_time = 1;  // Value in Microsecounds.
      var allData = {
        "header": [],
      };
      var averageOfPorts = {};

      var httpRequestInterval = setInterval(function() {
        if (! requestInProgress) {
          requestInProgress = true;
          sniff(port).done(function(result) {
            console.log("Port: " + port);
            console.log(result);
            var standardDiviation = {
              "header": standardDeviation(result["header"]),
            };
            console.log("standard diviation");
            console.log(standardDiviation);
          }).done(function(result) {
            allData["header"] = allData["header"].concat(result["header"]);
          }).done(function(result) {
            averageOfPorts[port] = {
              "header": mean(result["header"]),
            };
            console.log("Port");
            console.log(port);
            console.log("Average");
            console.log(averageOfPorts[port]);
          }).done(function(result) {
            port++;
            if (port > endPort) {
              $("#status").text("Finished").removeClass("badge-success").addClass("badge-secondary");
              $("#btn-discover").text("Discover").removeClass("btn-danger").addClass("btn-primary");
              var allStandardDeviation = {
                "header": standardDeviation(allData["header"]),
              };
              console.log("All SD");
              console.log(allStandardDeviation);
              console.log("Average by ports");
              console.log(averageOfPorts);
              var suspectedPorts = filterSuspectedPorts(averageOfPorts, allStandardDeviation)
              for (i=0; i<suspectedPorts.length; i++) {
                row = constructPortDescription(suspectedPorts[i]);
                $("tbody").append(row);
              };
              console.log("Suspected Ports");
              console.log(suspectedPorts);
              clearInterval(httpRequestInterval);
            }
            return result;
          }).done(function(result) {
            requestInProgress = false;
            return result;
          });
        }
      }, interval_time);
      event.preventDefault();
    } else {
      alert("Port file is still loading. Please try after some time.");
    }
  })
});
