/**
 * @ngdoc resource
 * @name cdsApp.resource:CDSUIVersionRsc
 * @module CDSUI
 * @description Check UI version
 *
 */
angular.module("cdsApp").service("CDSUIVersionRsc", function ($resource) {
    "use strict";
    return $resource("./version.json");
});
