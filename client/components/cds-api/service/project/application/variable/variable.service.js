/**
 * @ngdoc resource
 * @name cdsApp.resource:CDSApplicationVarRsc
 * @module cdsApp
 * @description API access to application variables. Only Update
 *
 */
angular.module("cdsApp").service("CDSApplicationVarRsc", function ($resource) {
    "use strict";
    return $resource("/cdsapi/project/:key/application/:appName/variable/:varName", {}, {
        update: {
            method: "PUT"
        }
    });
});
