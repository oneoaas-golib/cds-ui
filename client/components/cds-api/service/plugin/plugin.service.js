/*global angular*/

/**
 * @ngdoc resource
 * @name cdsApp.resource:CDSPluginRsc
 * @module cdsApp
 * @description
 *
 */
angular.module("cdsApp").service("CDSPluginRsc", function ($resource) {
    "use strict";
    return $resource("/cdsapi/plugin/:pluginName", {}, {
        update: {
            method : "PUT"
        }
    });
});

