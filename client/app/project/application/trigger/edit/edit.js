"use strict";

angular.module("cdsApp")
    .config(function ($stateProvider) {
        $stateProvider
            .state("app.application-trigger-edit", {
                url: "/project/:key/application/:appName/pipeline/:pipName/trigger/:triggerId",
                templateUrl: "app/project/application/trigger/edit/edit.html",
                controller: "TriggerEditCtrl",
                controllerAs: "ctrl",
                translations : ["app/project/application/trigger/edit"],
                resolve : {
                    $title: function ($stateParams) {
                        return "Trigger " + $stateParams.appName + " " + $stateParams.key;
                    }
                }
            });
    });
