 /*global angular*/

/**
 * @ngdoc resource
 * @name cdsApp.resource:CDSVariablesTypeRsc
 * @module cdsApp
 * @description
 *
 */
angular.module("cdsApp").service("CDSVariablesTypeRsc", function ($resource) {
    "use strict";
    return $resource("/cdsapi/variable/type", {}, {
        query: {
            method: "GET",
            isArray: true,
            cache: true
        }
    });
});
