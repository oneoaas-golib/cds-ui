/**
 * @ngdoc resource
 * @name cdsApp.resource:CDSApplicationPipelinesRsc
 * @module cdsApp
 * @description API access to application pipelines
 *
 */
angular.module("cdsApp").service("CDSApplicationPipelinesRsc", function ($resource) {
    "use strict";
    return $resource("/cdsapi/project/:key/application/:appName/pipeline/:pipName", {}, {
        update: {
            method: "PUT"
        },
        commit: {
            url: "/cdsapi/project/:key/application/:appName/pipeline/:pipName/commits",
            method: "GET",
            isArray: true,
            params: { envName: "@envName", hash: "@hash" }
        },
        schedulers: {
            url: "/cdsapi/project/:key/application/:appName/pipeline/:pipName/scheduler",
            method: "GET",
            isArray: true
        },
        addScheduler: {
            url: "/cdsapi/project/:key/application/:appName/pipeline/:pipName/scheduler",
            method: "POST"
        },
        updateScheduler: {
            url: "/cdsapi/project/:key/application/:appName/pipeline/:pipName/scheduler",
            method: "PUT"
        },
        deleteScheduler: {
            url: "/cdsapi/project/:key/application/:appName/pipeline/:pipName/scheduler/:id",
            method: "DELETE"
        }
    });
});

/**
 * @ngdoc resource
 * @name cdsApp.resource:CDSApplicationPipelineRunRsc
 * @module cdsApp
 * @description API access to run pipeline on an application
 *
 */
angular.module("cdsApp").service("CDSApplicationPipelineRunRsc", function ($resource) {
    "use strict";
    return $resource("/cdsapi/project/:key/application/:appName/pipeline/:pipName/run");
});

