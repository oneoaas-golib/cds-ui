"use strict";

angular.module("cdsApp")
    .config(function ($stateProvider) {
        $stateProvider
            .state("app.application-trigger-add", {
                url: "/project/:key/application/:appName/pipeline/:pipName/trigger?env",
                templateUrl: "app/project/application/trigger/add/add.html",
                controller: "TriggerAddCtrl",
                controllerAs: "ctrl",
                translations : ["app/project/application/trigger/add"],
                resolve : {
                    $title: function ($stateParams) {
                        return "Trigger " + $stateParams.appName + " " + $stateParams.key;
                    }
                }
            });
    });
