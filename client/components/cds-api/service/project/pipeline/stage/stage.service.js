/**
 * @ngdoc resource
 * @name cdsApp.resource:CDSStageRsc
 * @module cdsApp
 * @description No GET , No Query
 *
 */
angular.module("cdsApp").service("CDSStageRsc", function ($resource) {
    "use strict";
    return $resource("/cdsapi/project/:key/pipeline/:pipName/stage/:stageId", {}, {
        update : {
            method : "PUT"
        }
    });
});
