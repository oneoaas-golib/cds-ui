/**
 * @ngdoc resource
 * @name cdsApp.resource:CDSApplicationPipelineHistoryRsc
 * @module cdsApp
 * @description API access to the given application pipeline history
 *
 */
angular.module("cdsApp").service("CDSApplicationPipelineHistoryRsc", function ($resource) {
    "use strict";
    return $resource("/cdsapi/project/:key/application/:appName/pipeline/:pipName/history", {}, {
        query: {
            method: "GET",
            isArray: true,
            params: { envName: "@envName", limit: "@limit", status: "@status", stage: "@stage" }
        },
        branchHistory: {
            url : "/cdsapi/project/:key/application/:appName/history/branch",
            isArray: true,
            method: "GET",
            params: { page: "@page", perPage: "@perPage" }
        },
        deployHistory: {
            url : "/cdsapi/project/:key/application/:appName/history/env/deploy",
            isArray: true,
            method: "GET"
        }
    });
});
