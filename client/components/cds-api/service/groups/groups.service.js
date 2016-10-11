/**
 * @ngdoc resource
 * @name cdsApp.resource:CDSGroupsRsc
 * @module CDSUI
 * @description API access to groups
 *
 */
angular.module("cdsApp").service("CDSGroupsRsc", function ($resource) {
    "use strict";
    return $resource("/cdsapi/group/:groupName", {}, {
        updateGroup: {
            method: "PUT"
        }
    });
});
