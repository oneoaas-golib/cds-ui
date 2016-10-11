/*global angular*/

/**
 * @ngdoc resource
 * @name cdsApp.resource:CDSTemplateBuild
 * @module cdsApp
 * @description Access to build template
 *
 */
angular.module("cdsApp").service("CDSTemplateBuild", function ($resource) {
    "use strict";
    return $resource("/cdsapi/template/build", {}, {
        query: {
            method: "GET",
            isArray: true,
            cache: true
        }
    });
});

/**
 * @ngdoc resource
 * @name cdsApp.resource:CDSTemplateDeploy
 * @module cdsApp
 * @description Access to deploy template
 *
 */
angular.module("cdsApp").service("CDSTemplateDeploy", function ($resource) {
    "use strict";
    return $resource("/cdsapi/template/deploy", {}, {
        query: {
            method: "GET",
            isArray: true,
            cache: true
        }
    });
});
