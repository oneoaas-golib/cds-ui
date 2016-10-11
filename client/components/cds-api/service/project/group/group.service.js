/**
 * @ngdoc resource
 * @name cdsApp.resource:CDSProjectGroupsRsc
 * @module cdsApp
 * @description API access to groups of project.  Use only for update. GETis done by getProject
 *
 */
angular.module("cdsApp").service("CDSProjectGroupsRsc", function ($resource) {
    "use strict";
    return $resource("/cdsapi/project/:key/group", {}, {
        update: {
            method: "PUT"
        }
    });
});
