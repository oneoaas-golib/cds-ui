"use strict";

angular.module("cdsApp")
    .config(function ($stateProvider) {
        $stateProvider
            .state("app.application-show", {
                url: "/project/:key/application/:appName?tab&branch",
                templateUrl: "app/project/application/show/show.html",
                controller: "ApplicationShowCtrl",
                controllerAs: "ctrl",
                translations : ["app/project/application/show"],
                resolve : {
                    $title: function ($stateParams) {
                        return $stateParams.appName + " " + $stateParams.key;
                    }
                }
            });
    });
