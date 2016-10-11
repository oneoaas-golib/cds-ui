/*global angular*/

/**
 * @ngdoc resource
 * @name cdsApp.resource:CDSParametersTypeRsc
 * @module cdsApp
 * @description
 *
 */
angular.module("cdsApp").service("CDSNotificationTypeRsc", function ($resource) {
    "use strict";
    return $resource("/cdsapi/notification/type", {}, {
        types: {
            method: "GET",
            isArray: true,
            cache: true
        },
        states: {
            method: "GET",
            isArray: true,
            cache: true,
            url: "/cdsapi/notification/state"
        }
    });
});
