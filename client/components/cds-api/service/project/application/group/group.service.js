/**
 * @ngdoc resource
 * @name cdsApp.resource:CDSApplicationGroupsRsc
 * @module cdsApp
 * @description API access to groups of application. Only Update
 *
 */
angular.module("cdsApp").service("CDSApplicationGroupsRsc", function ($resource) {
    "use strict";
    return $resource("/cdsapi/project/:key/application/:appName/group", {}, {
        update: {
            method: "PUT"
        }
    });
});
