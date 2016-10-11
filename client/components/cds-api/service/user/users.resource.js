/*global angular*/

/**
 * @ngdoc resource
 * @name cdsApp.resource:CDSUserRsc
 * @module cdsApp
 * @description Service to manipulate user
 *
 */
angular.module("cdsApp").service("CDSUserRsc", function ($resource) {
    "use strict";
    return $resource("/cdsapi/user/:userName", {}, {
        update: {
            method: "PUT",
            isArray: false
        }
    });
});
