"use strict";

angular.module("cdsApp")
    .config(function ($stateProvider) {
        $stateProvider
            .state("app.application-pipeline-launch", {
                url: "/project/:key/application/:appName/pipeline/:pipName?env&trigger&branch",
                templateUrl: "app/project/application/pipeline/launch/launch.html",
                controller: "PipelineLaunchCtrl",
                controllerAs: "ctrl",
                translations : ["app/project/application/pipeline/launch"],
                resolve : {
                    $title: function ($stateParams) {
                        return $stateParams.pipName + " " + $stateParams.appName + " " + $stateParams.key;
                    }
                }
            });
    });
