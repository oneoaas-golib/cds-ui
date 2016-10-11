/**
 * @ngdoc resource
 * @name cdsApp.resource:CDSPipelineBuildRsc
 * @module cdsApp
 * @description
 *
 */
angular.module("cdsApp").service("CDSPipelineBuildRsc", function ($resource) {
    "use strict";
    return $resource("/cdsapi/project/:key/application/:appName/pipeline/:pipName/build/:buildId",
        { "key": "@key", "appName": "@appName", "pipName": "@pipName", "buildId": "@buildId" }, {
            get: {
                method: "GET",
                isArray: false,
                params: { envName: "@envName" }
            },
            stop: {
                url : "/cdsapi/project/:key/application/:appName/pipeline/:pipName/build/:buildId/stop",
                method: "POST",
                params: { envName: "@envName" }
            },
            runAgain: {
                url : "/cdsapi/project/:key/application/:appName/pipeline/:pipName/build/:buildId/restart",
                method: "POST",
                params: { envName: "@envName" }
            },
            rollback: {
                url : "/cdsapi/project/:key/application/:appName/pipeline/:pipName/rollback",
                method: "POST"
            },
            getArtifacts: {
                url : "/cdsapi/project/:key/application/:appName/pipeline/:pipName/:buildId/artifact",
                isArray: true,
                method: "GET",
                params: { envName: "@envName" }
            },
            downloadArtifact: {
                url : "/cdsapi/project/:key/application/:appName/pipeline/:pipName/artifact/download/:artifactId",
                isArray: false,
                responseType: "arraybuffer",
                method: "GET",
                transformResponse: function (data) {
                    // Stores the ArrayBuffer object in a property called "data"
                    return { data : data };
                }
            },
            getTests: {
                url : "/cdsapi/project/:key/application/:appName/pipeline/:pipName/build/:buildId/test",
                isArray: false,
                method: "GET",
                params: { envName: "@envName" }
            },
            commits : {
                url : "/cdsapi/project/:key/application/:appName/pipeline/:pipName/build/:buildId/commits",
                isArray: true,
                method: "GET"
            },
            getNextBuild: {
                url : "/cdsapi/project/:key/application/:appName/pipeline/:pipName/build/:buildId/triggered",
                isArray: true,
                method: "GET"
            }

        });
});
