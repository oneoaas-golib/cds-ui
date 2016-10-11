/**
 * @ngdoc resource
 * @name cdsApp.resource:CDSProjectsRsc
 * @module CDSUI
 * @description API access to projects
 *
 */
angular.module("cdsApp").service("CDSRepoManagerRsc", function ($resource) {
    "use strict";
    return $resource("/cdsapi/repositories_manager", {}, {
        getByProject: {
            method: "GET",
            isArray: true,
            url: "/cdsapi/project/:key/repositories_manager"
        },
        link: {
            method: "POST",
            isArray: false,
            url: "/cdsapi/project/:key/repositories_manager/:repoManName/authorize"
        },
        callback: {
            method: "POST",
            isArray: false,
            url: "/cdsapi/project/:key/repositories_manager/:repoManName/authorize/callback"
        },
        repos: {
            method: "GET",
            isArray: true,
            url: "/cdsapi/project/:key/repositories_manager/:repoManName/repos"
        },
        attachRepo: {
            method: "POST",
            isArray: false,
            url: "/cdsapi/project/:key/repositories_manager/:repoManName/application/:appName/attach",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            }
        },
        detachRepo: {
            method: "POST",
            isArray: false,
            url: "/cdsapi/project/:key/repositories_manager/:repoManName/application/:appName/detach"
        },
        repo: {
            method: "GET",
            isArray: false,
            url: "/cdsapi/project/:key/repositories_manager/:repoManName/repo",
            params: { "repo": "@repo" }
        }
    });
});
