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

  /*
   * Approach -2 (Using readyState property)
   * Source: http://blog.andlabs.org/2010/12/port-scanning-with-html5-and-js-recon.html
   */
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

  $("#port-form").submit(function(event) {
    if (portFileLoaded) {
      var startPort = parseInt($("#start-port").val());
      var endPort = parseInt($("#end-port").val());
      var port = startPort;
      var requestInProgress = false;
      var interval_time = 1;  // Value in Microsecounds.


      var httpRequestInterval = setInterval(function() {
        if (! requestInProgress) {
          requestInProgress = true;
          sendRequest(port).done(function(result) {
            var thresold = 100;  // Value in Microsecounds
            if (result["timeTook"] >= thresold) {
              row = constructPortDescription(result["port"]);
              $("tbody").append(row);
            }
          }).done(function(result) {
            port++;
            if (port > endPort) {
              $("#status").text("Finished").removeClass("badge-success").addClass("badge-secondary");
              $("#btn-discover").text("Discover").removeClass("btn-danger").addClass("btn-primary");
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
