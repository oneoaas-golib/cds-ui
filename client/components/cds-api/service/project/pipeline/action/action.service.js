
/**
 * @ngdoc resource
 * @name cdsApp.resource:CDSPipelineJoinedActionRsc
 * @module cdsApp
 * @description
 *
 */
angular.module("cdsApp").service("CDSPipelineJoinedActionRsc", function ($resource) {
    "use strict";
    return $resource("/cdsapi/project/:key/pipeline/:pipName/stage/:stageId/joined/:actionId", {}, {
        update: {
            method: "PUT"
        },
        audit: {
            url: "/cdsapi/project/:key/pipeline/:pipName/stage/:stageId/joined/:actionId/audit",
            method: "GET",
            isArray: true
        }
    });
});
/**
 * @ngdoc resource
 * @name cdsApp.resource:CDSPipelineActionRsc
 * @module cdsApp
 * @description  Only Update
 *
 */
angular.module("cdsApp").service("CDSPipelineActionRsc", function ($resource) {
    "use strict";
    return $resource("/cdsapi/project/:key/pipeline/:pipName/action/:pipelineActionId", {}, {
        update : {
            method: "PUT"
        }
    });
});
