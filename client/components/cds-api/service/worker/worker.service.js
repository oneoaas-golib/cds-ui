/**
 * @ngdoc resource
 * @name cdsApp.resource:CDSWorkersRsc
 * @module cdsApp
 * @description
 *
 */
angular.module("cdsApp").service("CDSWorkersRsc", function ($resource) {
    "use strict";
    return $resource("/cdsapi/worker", {}, {
        loadOrphanWorkers: {
            method: "GET",
            isArray: true,
            params: { orphan: true }
        }
    });
});
