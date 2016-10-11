"use strict";

angular.module("cdsApp")
    .config(function ($stateProvider) {
        $stateProvider
            .state("app.pipeline-show", {
                url: "/project/:key/pipeline/:pipName?tab",
                templateUrl: "app/project/pipeline/show/show.html",
                controller: "PipelineShowCtrl",
                controllerAs: "ctrl",
                translations: ["app/project/pipeline/show"],
                resolve : {
                    $title: function ($stateParams) {
                        return $stateParams.pipName + " " + $stateParams.key;
                    }
                }
            });
    });
