/*global angular*/

/**
 * @ngdoc resource
 * @name cdsApp.resource:CDSActionRsc
 * @module cdsApp
 * @description
 *
 */
angular.module("cdsApp").service("CDSActionRsc", function ($resource) {
    "use strict";
    return $resource("/cdsapi/action/:actionName", {}, {
        update: {
            method : "PUT"
        },
        pipelines: {
            url: "/cdsapi/action/:actionName/using",
            method: "GET",
            isArray: true
        },
        audit: {
            url: "/cdsapi/action/:actionId/audit",
            method: "GET",
            isArray: true
        }
    });
});

