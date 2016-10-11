"use strict";

angular.module("cdsApp")
    .config(function ($stateProvider) {
        $stateProvider
            .state("app.group-list", {
                url: "/group",
                templateUrl: "app/group/list/list.html",
                controller: "GroupListCtrl",
                controllerAs: "ctrl",
                translations : ["app/group/list"],
                resolve : {
                    $title: function () {
                        return "Groups";
                    }
                }
            });
    });
