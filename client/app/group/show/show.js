"use strict";

angular.module("cdsApp")
    .config(function ($stateProvider) {
        $stateProvider
            .state("app.group-show", {
                url: "/group/:groupName",
                templateUrl: "app/group/show/show.html",
                controller: "GroupShowCtrl",
                controllerAs: "ctrl",
                translations : ["app/group/show"],
                resolve : {
                    $title: function ($stateParams) {
                        return $stateParams.groupName;
                    }
                }
            });
    });
