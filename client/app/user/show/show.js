"use strict";

angular.module("cdsApp")
    .config(function ($stateProvider) {
        $stateProvider
            .state("app.user-show", {
                url: "/user/:userName",
                templateUrl: "app/user/show/show.html",
                controller: "UserShowCtrl",
                controllerAs: "ctrl",
                translations : ["app/user/show"],
                resolve : {
                    $title: function ($stateParams) {
                        return "Hello padawan " + $stateParams.userName;
                    }
                }
            });
    });
