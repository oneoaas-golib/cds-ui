/**
 * @ngdoc resource
 * @name cdsApp.resource:CDSEnvRsc
 * @module cdsApp
 * @description API access to one environment
 *
 */
angular.module("cdsApp").service("CDSEnvRsc", function ($resource) {
    "use strict";

    return $resource("/cdsapi/project/:key/environment/:envName", {}, {
        update: {
            method: "PUT"
        },
        audit: {
            method: "GET",
            url: "/cdsapi/project/:key/environment/:envName/audit",
            isArray: true
        },
        restoreAudit: {
            method: "PUT",
            url: "/cdsapi/project/:key/environment/:envName/audit/:auditId",
        }
    });
});
