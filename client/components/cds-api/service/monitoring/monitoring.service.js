 /*global angular*/

/**
 * @ngdoc resource
 * @name cdsApp.resource:CDSWarninRsc
 * @module cdsApp
 * @description
 *
 */
angular.module("cdsApp").service("CDSMonitoringRsc", function ($resource) {
    "use strict";
    return $resource("/cdsapi/mon", {}, {
        warning: {
            url: "/cdsapi/mon/warning",
            method: "GET",
            isArray: true
        }
    });
});
