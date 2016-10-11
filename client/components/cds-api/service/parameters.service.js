/*global angular*/

/**
 * @ngdoc resource
 * @name cdsApp.resource:CDSParametersTypeRsc
 * @module cdsApp
 * @description
 *
 */
angular.module("cdsApp").service("CDSParametersTypeRsc", function ($resource) {
    "use strict";
    return $resource("/cdsapi/parameter/type", {}, {
        query: {
            method: "GET",
            isArray: true,
            cache: true
        }
    });
});
