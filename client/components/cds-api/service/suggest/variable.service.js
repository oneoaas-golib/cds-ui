/**
 * @ngdoc resource
 * @name cdsApp.resource:CDSSuggestVariableRsc
 * @module cdsApp
 * @description
 *
 */
angular.module("cdsApp").service("CDSSuggestVariableRsc", function ($resource) {
    "use strict";

    return $resource("/cdsapi/suggest/variable/:key", {}, {
        list: {
            method: "GET",
            isArray: true,
            params: { appName: "@appName" }
        }
    });
});
