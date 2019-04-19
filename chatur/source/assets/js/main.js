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
  var iteration = 10;  // Works nearly to expected

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

  var standard_diviation = function(arr) {
    return Math.sqrt(variance(arr));
  };

  var requestPort = function(port) {
    var deferred = $.Deferred();
    var xhr = new XMLHttpRequest();
    var startTime = null;
    var responseTime = {};

    xhr.onreadystatechange = function () {
      if (xhr.readyState === 1) {
        startTime =  Date.now();
      } else if (xhr.readyState === 2) {
        responseTime["header"] = Date.now() - startTime;
      } else if (xhr.readyState === 4) {
        responseTime["body"] = Date.now() - startTime;
        responseTime["difference"] = (responseTime["body"] - responseTime["header"]);
        deferred.resolve(responseTime);
      }
    };

    xhr.open('GET', "http://127.0.0.1:" + port, true);
    xhr.send();
    return deferred;
  };

  var burst = function(port, concurrentRequests) {
    var deferred = $.Deferred();
    var pendingResponses = 0;
    var responseTimeCollection = {
      "header": [],
      "body": [],
      "difference": []
    };

    for (i=0; i<concurrentRequests; i++) {
      requestPort(port).done(function(result) {
        responseTimeCollection["header"].push(result["header"]);
        responseTimeCollection["body"].push(result["body"]);
        responseTimeCollection["difference"].push(result["difference"]);
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
      "body": [],
      "difference": []
    };
    var requestPending = false;

    var intervalObj = setInterval(function() {
      if (! requestPending) {
        requestPending = true;
        burst(port, concurrentRequests=6).done(function(result) {
          responseTimeCollectionByIteration["header"] = responseTimeCollectionByIteration["header"].concat(result["header"]);
          responseTimeCollectionByIteration["body"] = responseTimeCollectionByIteration["body"].concat(result["body"]);
          responseTimeCollectionByIteration["difference"] = responseTimeCollectionByIteration["difference"].concat(result["difference"]);
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
      (averageResponseTime["header"] > standardDeviation["header"]) &&
      (averageResponseTime["body"] > standardDeviation["body"]) &&
      (averageResponseTime["difference"] > standardDeviation["difference"])
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
      "startTime": {},
      "headerTime": {},
      "tookTime": {}
    };

    for (i=0; i<concurrentRequests; i++) {
      requestPort(port, i, responseTime, deferred, concurrentRequests);
    };

    return deferred;
  };

  /*
   * Approach -2 (Using readyState property)
   * Source: http://blog.andlabs.org/2010/12/port-scanning-with-html5-and-js-recon.html

  var sendRequest = function(port) {
    var startTime = null;
    var headerTime = null;
    var responseTime = null;
    var deferred = $.Deferred();

    var xhr = new XMLHttpRequest();


    xhr.onreadystatechange = function () {
      if (xhr.readyState === 2) {
        responseTimeHeader = (Date.now() - startTime);
        console.log("I am in state 2 for port " + port + " response time for header: " + responseTimeHeader);
      } else if (xhr.readyState === 4) {
        responseTime = (Date.now() - startTime);
        console.log("I am in state 4 for port " + port + " response time: " + responseTime);
        deferred.resolve({"port": port, "timeTook": responseTime});
      }
    };

    xhr.open('GET', "http://127.0.0.1:" + port, true);
    startTime = Date.now();
    xhr.send();
    return deferred;
  };
  */

  /* Approach -1 (Based on time)
   * *****************************
    var sendRequest = function(port) {
    var startTime = null;
    var timeTook = null;
    var deferred = $.Deferred();

    $.ajax({
      url: "http://127.0.0.1:" + port,
      beforeSend: function(jqXHR, settings) {
        results[port] = {"startTime": Date.now()};
      },
      crossDomain: true
    }).always(function(result) {
      timeTook = Date.now() - results[port]["startTime"];
      deferred.resolve({"port": port, "timeTook": timeTook});
    });
    return deferred;
  };
  */

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
        "body": [],
        "difference": []
      };
      var averageOfPorts = {};

      var httpRequestInterval = setInterval(function() {
        if (! requestInProgress) {
          requestInProgress = true;
          sniff(port).done(function(result) {
            console.log("Port: " + port);
            console.log(result);
            var standardDiviation = {
              "header": standard_diviation(result["header"]),
              "body": standard_diviation(result["body"]),
              "difference": standard_diviation(result["difference"])
            };
            console.log("standard diviation");
            console.log(standardDiviation);
          }).done(function(result) {
            allData["header"] = allData["header"].concat(result["header"]);
            allData["body"] = allData["body"].concat(result["body"]);
            allData["difference"] = allData["difference"].concat(result["difference"]);
          }).done(function(result) {
            averageOfPorts[port] = {
              "header": mean(result["header"]),
              "body": mean(result["body"]),
              "difference": mean(result["difference"])
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
                "header": standard_diviation(allData["header"]),
                "body": standard_diviation(allData["body"]),
                "difference": standard_diviation(allData["difference"])
              };
              console.log("All SD");
              console.log(allStandardDeviation);
              console.log("Average by ports");
              console.log(averageOfPorts);
              console.log("Suspected Ports");
              var suspectedPorts = filterSuspectedPorts(averageOfPorts, allStandardDeviation)
              for (i=0; i<suspectedPorts.length; i++) {
                row = constructPortDescription(suspectedPorts[i]);
                $("tbody").append(row);
              };
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
