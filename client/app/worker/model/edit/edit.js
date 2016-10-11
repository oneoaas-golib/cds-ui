"use strict";

angular.module("cdsApp")
    .config(function ($stateProvider) {
        $stateProvider
            .state("app.worker-model-edit", {
                url: "/worker/model/:modelName",
                templateUrl: "app/worker/model/edit/edit.html",
                controller: "WorkerModelEditCtrl",
                controllerAs: "ctrl",
                translations : ["app/worker/model/edit"],
                resolve : {
                    $title: function ($stateParams) {
                        return $stateParams.modelName;
                    }
                }
            });
    });
