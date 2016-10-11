/**
 * @ngdoc resource
 * @name cdsApp.resource:CDSTemplateProjectRsc
 * @module cdsApp
 * @description
 *
 */
angular.module("cdsApp").service("CDSTemplateProjectRsc", function ($resource) {
    "use strict";
    return $resource("/cdsapi/template/:key");
});

