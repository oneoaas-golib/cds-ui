"use strict";

angular.module("cdsApp")
    .config(function ($stateProvider) {
        $stateProvider
            .state("app.application-add", {
                url: "/project/:key/application",
                templateUrl: "app/project/application/add/add.html",
                controller: "ApplicationAddCtrl",
                controllerAs: "ctrl",
                translations : [],
                title: ["key"]
            });
    });
