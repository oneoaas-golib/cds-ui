/**
 * @ngdoc resource
 * @name cdsApp.resource:CDSProjectsRsc
 * @module CDSUI
 * @description API access to projects
 *
 */
angular.module("cdsApp").service("CDSProjectsRsc", function ($resource) {
    "use strict";
    return $resource("/cdsapi/project", {}, {
        list: {
            method: "GET",
            isArray: true,
            params: { pipeline: "@pipeline", application: "@application", environment: "@environment" }
        },
        create: {
            method: "POST"
        }
    });
});

/**
 * @ngdoc resource
 * @name cdsApp.resource:CDSProjectRsc
 * @module CDSUI
 * @description API access to the given project
 *
 */
angular.module("cdsApp").service("CDSProjectRsc", function ($resource) {
    "use strict";
    return $resource("/cdsapi/project/:key", {}, {
        get: {
            method: "GET",
            isArray: false,
            params: { applicationHistory: "@applicationHistory", applicationStatus: "@applicationStatus" }
        },
        update: {
            method: "PUT",
            isArray: false
        },
        audit: {
            url: "/cdsapi/project/:key/variable/audit",
            method: "GET",
            isArray: true
        },
        restoreAudit: {
            url: "/cdsapi/project/:key/variable/audit/:auditId",
            method: "PUT"
        }
    });
});
