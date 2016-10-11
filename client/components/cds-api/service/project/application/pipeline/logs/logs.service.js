/**
 * @ngdoc resource
 * @name cdsApp.resource:CDSApiPipelineActionLogRsc
 * @module CDSUI
 * @description
 *
 */
angular.module("cdsApp").service("CDSPipelineLogsRsc", function ($resource) {
    "use strict";
    return $resource("/cdsapi/project/:key/application/:appName/pipeline/:pipName/build/:id/action/:actionID/log",
        { "key": "@key", "appName": "@appName", "pipName": "@pipName", "id": "@id", "actionID": "@actionID" }, {
            get: {
                method: "GET",
                isArray: false,
                params: { envName: "@envName" }
            }
        });
});
