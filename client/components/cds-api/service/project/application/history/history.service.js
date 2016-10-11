/**
 * @ngdoc resource
 * @name cdsApp.resource:CDSApplicationHistoryRsc
 * @module cdsApp
 * @description API access to the given application history
 *
 */
angular.module("cdsApp").service("CDSApplicationHistoryRsc", function ($resource) {
    "use strict";
    return $resource("/cdsapi/project/:key/application/:appName/history");
});
