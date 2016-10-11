"use strict";

angular.module("cdsApp")
    .config(function ($stateProvider) {
        $stateProvider
            .state("app.action-show", {
                url: "/action/:actionName?tab",
                templateUrl: "app/action/show/show.html",
                controller: "ActionShowCtrl",
                controllerAs: "ctrl",
                translations : ["app/action/show"],
                resolve : {
                    $title: function ($stateParams) {
                        return $stateParams.actionName;
                    }
                }
            });
    });
