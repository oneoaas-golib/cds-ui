/**
 * @ngdoc resource
 * @name cdsApp.resource:CDSTriggersRsc
 * @module cdsApp
 * @description API access to triggers
 *
 */
angular.module("cdsApp").service("CDSTriggersRsc", function ($resource) {
    "use strict";
    return $resource("/cdsapi/project/:key/application/:appName/pipeline/:pipName/trigger/:triggerId", {}, {
        update: {
            method: "PUT"
        }
    });
});
