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

  /*
   * Approach -2 (Using readyState property)
   * Source: http://blog.andlabs.org/2010/12/port-scanning-with-html5-and-js-recon.html
   */
  var sendRequest = function(port) {
    var startTime = null;
    var headerTime = null;
    var responseTime = null;
    var timeTook = null;
    var deferred = $.Deferred();

    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function () {
      if (xhr.readyState === 1) {
        startTime = Date.now();
      } else if (xhr.readyState === 2) {
        headerTime = (Date.now() - startTime);
      } else if (xhr.readyState === 4) {
        responseTime = (Date.now() - startTime);
        avgResponseTime = (headerTime + responseTime) / 2.0;
        timeTook = avgResponseTime;
        deferred.resolve({"port": port, "timeTook": timeTook});
      }
    };
    xhr.open('GET', "http://127.0.0.1:" + port, true);
    xhr.send(null);

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

  var readPortsFile = function(location) {
    return $.getJSON(location, function(result) {
      TCPlist = result;
    });
  };

  readPortsFile("assets/data/tcp_ports.json").done(function(result){
    portFileLoaded = true;
  });

  $("#port-form").submit(function(event) {
    if (portFileLoaded) {
      if (! scanRunning) {
        scanRunning = true;
        $("#status").text("Scanning").removeClass("badge-secondary").addClass("badge-success");
        $("#btn-discover").text("Stop").removeClass("btn-primary").addClass("btn-danger");
        var startPort = parseInt($("#start-port").val());
        var endPort = parseInt($("#end-port").val());
        var port = startPort;

        interval = setInterval(function() {
          sendRequest(port).done(function(result) {
            if (result["timeTook"] >= 100){
              row = $("<tr></tr>");
              dataPort = $("<td></td>").text(result["port"]);
              if (!(result["port"] in TCPlist)) {
                description = "Unknown";
              } else {
                description = TCPlist[result["port"]];
              }
              dataDescription = $("<td></td>").text(description);
              row.append(dataPort);
              row.append(dataDescription);
              $("tbody").append(row);
            }
          });

          if (port >= endPort) {
            $("#status").text("Finished").removeClass("badge-success").addClass("badge-secondary");
            clearInterval(interval);
          }
          port++;
        }, 2000);
        event.preventDefault();
      } else {
        $("#status").text("Finished").removeClass("badge-success").addClass("badge-secondary");
        $("#btn-discover").text("Discover").removeClass("btn-danger").addClass("btn-primary");
        clearInterval(interval);
        scanRunning = false;
        event.preventDefault();
      }
    } else {
      alert("Port file is still loading. Please try after some time.");
    }
  });
});
