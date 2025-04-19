import Postmonger from 'postmonger';
define(["postmonger"], function (Postmonger) {
"use strict";
var connection = new Postmonger.Session();
var payload = {};

$(window).ready(onRender);

connection.on("initActivity", initialize);
connection.on("requestedTokens", onGetTokens);
connection.on("requestedEndpoints", onGetEndpoints);


function onRender() {
    connection.trigger("ready");
    connection.trigger("requestTokens");
    connection.trigger("requestEndpoints");
    save();
}

function initialize(data) {
    console.log(data);
    if (data) {
        payload = data;
    }
    payload = data || {};
    payload['metaData'] = payload['metaData'] || {};
    payload['metaData'].isConfigured = true;
}

function onGetTokens(tokens) {
    // You can use tokens if needed for additional functionality.
    // Example: tokens.fuel2token
}

function onGetEndpoints(endpoints) {
    // Use endpoints if needed for additional functionality.
    // Example: endpoints.restHost
}

function save() {
    // The `sendEmail` value is configured dynamically via your backend logic
    payload['arguments'] = payload['arguments'] || {};
    payload['arguments'].execute = {
        inArguments: [
            {
                dayCheckEndpoint: "https://weekday-checker-7c974993cfeb.herokuapp.com/execute",
            },
        ],
    };

    connection.trigger("updateActivity", payload);
}
