"use strict";

angular.module("cdsApp")
    .config(function ($stateProvider) {
        $stateProvider
            .state("app.project-add", {
                url: "/project",
                templateUrl: "app/project/add/add.html",
                controller: "ProjectAddCtrl",
                controllerAs: "ctrl",
                translations : ["app/project", "app/project/add"]
            });
    });
