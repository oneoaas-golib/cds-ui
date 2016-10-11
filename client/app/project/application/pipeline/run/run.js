"use strict";

angular.module("cdsApp")
    .config(function ($stateProvider) {
        $stateProvider
            .state("app.application-pipeline-build", {
                url: "/project/:key/application/:appName/pipeline/:pipName/build/:buildId?env&tab",
                templateUrl: "app/project/application/pipeline/run/run.html",
                controller: "PipelineRunCtrl",
                controllerAs: "ctrl",
                translations : ["app/project/application/pipeline/run"],
                resolve : {
                    $title: function ($stateParams) {
                        return $stateParams.pipName + " " + $stateParams.appName + " " + $stateParams.key;
                    }
                }
            });
    });
