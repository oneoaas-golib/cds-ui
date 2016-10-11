/**
 * @ngdoc resource
 * @name cdsApp.resource:CDSHookRsc
 * @module cdsApp
 * @description API access to hooks
 *
 */
angular.module("cdsApp").service("CDSHookRsc", function ($resource) {
    "use strict";
    return $resource("/cdsapi/project/:key/application/:appName/hook", {}, {
        update: {
            method: "PUT",
            url : "/cdsapi/project/:key/application/:appName/pipeline/:pipName/hook/:hookId"
        },
        create : {
            method: "POST",
            url : "/cdsapi/project/:key/application/:appName/pipeline/:pipName/hook"
        },
        delete : {
            method: "DELETE",
            url : "/cdsapi/project/:key/application/:appName/pipeline/:pipName/hook/:hookId"
        },
        createWithRepo: {
            method: "POST",
            url: "/cdsapi/project/:key/application/:appName/repositories_manager/:repoManName/hook",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            }
        }
    });
});
