"use strict";

angular.module("cdsApp")
    .config(function ($stateProvider) {
        $stateProvider
            .state("app.home", {
                url: "/",
                templateUrl: "app/home/home.html",
                controller: "HomeCtrl",
                controllerAs: "home",
                translations : ["app/common"],
                resolve : {
                    $title: function () {
                        return "Welcome on CDS";
                    }
                }
            });
    });
