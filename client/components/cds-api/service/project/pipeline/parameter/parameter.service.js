/**
 * @ngdoc resource
 * @name cdsApp.resource:CDSPipelineParametersRsc
 * @module cdsApp
 * @description Only update pipeline parameters
 *
 */
angular.module("cdsApp").service("CDSPipelineParametersRsc", function ($resource) {
    "use strict";
    return $resource("/cdsapi/project/:key/pipeline/:pipName/parameter", {}, {
        update : {
            isArray: true,
            method: "PUT"
        }
    });
});
