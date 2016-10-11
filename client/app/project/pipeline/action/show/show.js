"use strict";

angular.module("cdsApp")
    .config(function ($stateProvider) {
        $stateProvider
            .state("app.pipeline-action-show", {
                url: "/project/:key/pipeline/:pipName/stage/:stageId/action/:actionId?edit&tab",
                templateUrl: "app/project/pipeline/action/show/show.html",
                controller: "PipelineActionShowCtrl",
                controllerAs: "ctrl",
                translations: [],
                resolve : {
                    $title: function ($stateParams) {
                        return $stateParams.pipName + " " + $stateParams.key;
                    }
                }
            });
    });
