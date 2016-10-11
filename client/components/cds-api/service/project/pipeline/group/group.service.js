/**
 * @ngdoc resource
 * @name cdsApp.resource:CDSPipelineGroupsRsc
 * @module cdsApp
 * @description API access to groups of pipeline. Only Update
 *
 */
angular.module("cdsApp").service("CDSPipelineGroupsRsc", function ($resource) {
    "use strict";
    return $resource("/cdsapi/project/:key/pipeline/:pipName/group", {}, {
        update: {
            method: "PUT"
        }
    });
});
