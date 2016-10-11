"use strict";

angular.module("cdsApp")
    .config(function ($stateProvider) {
        $stateProvider
            .state("app.project-show", {
                url: "/project/:key?tab&add",
                templateUrl: "app/project/show/show.html",
                controller: "ProjectShowCtrl",
                controllerAs: "ctrl",
                translations : ["app/project", "app/project/show"],
                resolve : {
                    $title: function ($stateParams) {
                        return $stateParams.key;
                    }
                }
            });
    });
