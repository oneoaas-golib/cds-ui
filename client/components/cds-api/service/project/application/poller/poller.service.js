/**
 * @ngdoc resource
 * @name cdsApp.resource:CDSPollerRsc
 * @module cdsApp
 * @description API access to pollers
 *
 */
angular.module("cdsApp").service("CDSPollerRsc", function ($resource) {
    "use strict";
    return $resource("/cdsapi/project/:key/application/:appName/polling", {}, {
        update: {
            method: "PUT",
            url : "/cdsapi/project/:key/application/:appName/pipeline/:pipName/polling"
        },
        create : {
            method: "POST",
            url : "/cdsapi/project/:key/application/:appName/pipeline/:pipName/polling"
        },
        delete : {
            method: "DELETE",
            url : "/cdsapi/project/:key/application/:appName/pipeline/:pipName/polling"
        }
    });
});
