/*
 * main.js
 * Copyright (C) 2019 jay <jay@altair>
 *
 * Distributed under terms of the MIT license.
 */
$(document).ready(function() {
  //var sendRequest = function(port) {
  //  console.log("Scanning for port " + port);

  //  var startTime = Date.now();
  //  var img = new Image();

  //  img.onload = function() {
  //    var interval = Date.now() - startTime;
  //    console.log("Took: " + interval);
  //    console.log("loaded the iamge");
  //  };

  //  img.onerror = function() {
  //    var interval = Date.now() - startTime;
  //    console.log("For port: " + port + " Took: " + interval);
  //    console.log("Error");
  //  };

  //  img.src = "http://127.0.0.1:" + port;
  //};

  var showEndTime = function(port, startTime){
    console.log("Port: " + port + " Took " + (Date.now() - startTime));
  };

  var sendRequest = function(port) {
    console.log("Requesting for: " + port);
    var client = new XMLHttpRequest()
    client.open("GET", "http://127.0.0.1:" + port);
    client.ontimeout = function(e) {
      console.log("In ontimeout");
      showEndTime(port, startTime);
    }
    client.onload = function() {
      console.log("In onload");
      showEndTime(port, startTime);
    };
    client.onerror = function() {
      console.log("In onerror");
      showEndTime(port, startTime);
    };
    client.onabort = function() {
      console.log("In onabort");
      showEndTime(port, startTime);
    };
    client.onprogress = function() {
      console.log("In Progress");
      showEndTime(port, startTime);
    };
    var startTime = Date.now();
    client.send()
  };

  sendRequest(8000);
  sendRequest(3088);

  sendRequest(8080);
  sendRequest(8080);

  //$("#image-one").one("load", function() {
  //  console.log("Loaded image one");
  //}).on("error", function(event) {
  //  console.log("error while loading image one");
  //}).on("ready", function(event) {
  //  console.log("I am ready!");
  //});

  //$("#image-two").on("load", function(event) {
  //  console.log("Loaded image two");
  //}).on("error", function(event) {
  //  console.log("error while loading image two");
  //});


  //$("#image-three").on("load", function(event) {
  //  console.log("Loaded image three");
  //}).on("error", function(event) {
  //  console.log("error while loading image three");
  //}).on("ready", function(event) {
  //  console.log("I am ready!");
  //});
});
