"use strict";

angular.module("cdsApp")
    .config(function ($stateProvider) {
        $stateProvider
            .state("app.worker-list", {
                url: "/worker",
                templateUrl: "app/worker/list/list.html",
                controller: "WorkerListCtrl",
                controllerAs: "ctrl",
                translations : ["app/worker/list"],
                resolve : {
                    $title: function () {
                        return "Workers";
                    }
                }
            });
    });
