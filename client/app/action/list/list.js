"use strict";

angular.module("cdsApp")
    .config(function ($stateProvider) {
        $stateProvider
            .state("app.action-list", {
                url: "/action",
                templateUrl: "app/action/list/list.html",
                controller: "ActionListCtrl",
                controllerAs: "ctrl",
                translations : ["app/action/list"],
                resolve : {
                    $title: function () {
                        return "Actions";
                    }
                }
            });
    });
