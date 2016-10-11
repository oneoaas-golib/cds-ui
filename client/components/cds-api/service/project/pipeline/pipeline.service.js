/**
 * @ngdoc resource
 * @name cdsApp.resource:CDSPipelineRsc
 * @module cdsApp
 * @description
 *
 */
angular.module("cdsApp").service("CDSPipelineRsc", function ($resource) {
    "use strict";
    return $resource("/cdsapi/project/:key/pipeline/:pipName", {}, {
        update: {
            method: "PUT",
            isArray: false
        },
        getApplications: {
            method: "GET",
            isArray: true,
            url : "/cdsapi/project/:key/pipeline/:pipName/application"
        }
    });
});

/**
 * @ngdoc resource
 * @name cdsApp.resource:CDSPipelineTypeRsc
 * @module cdsApp
 * @description
 *
 */
angular.module("cdsApp").service("CDSPipelineTypeRsc", function ($resource) {
    "use strict";
    return $resource("/cdsapi/pipeline/type", {}, {
        query: {
            method: "GET",
            isArray: true,
            cache: true
        }
    });
});
