/*
 * main.js
 * Copyright (C) 2019 jay <jay@altair>
 *
 * Distributed under terms of the MIT license.
 */
$(document).ready(function() {
  var results = {};
  var sendRequest = function(port) {
    var startTime = null;
    var timeTook = null;
    var deferred = $.Deferred();

    console.log("I am in function");
    $.ajax({
      url: "http://127.0.0.1:" + port,
      beforeSend: function(jqXHR, settings) {
        console.log("About to start the request");
        results[port] = {"startTime": Date.now()};
      },
      crossDomain: true
    }).always(function(result) {
      console.log("Response arrieved");
      timeTook = Date.now() - results[port]["startTime"];
      deferred.resolve({"port": port, "timeTook": timeTook});
    });
    console.log("I am returned");
    return deferred;
  };

  $("#port-form").submit(function(event) {
    var startPort = parseInt($("#start-port").val());
    var endPort = parseInt($("#end-port").val());
    var port = startPort;

    var interval = setInterval(function() {
      sendRequest(port).done(function(result) {
        text = "Port: " + result["port"] + " Time took: " + result["timeTook"];
        resultElement = $("<p></p>").text(text);
        $("body").append(resultElement);
      });

      if (port >= endPort) {
        clearInterval(interval);
      }
      port++;
    }, 3000);
    event.preventDefault();
  });
});
