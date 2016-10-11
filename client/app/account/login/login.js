"use strict";

angular.module("cdsApp")
    .config(function ($stateProvider) {
        $stateProvider
            .state("login", {
                url: "/login",
                templateUrl: "app/account/login/login.html",
                controller: "LoginCtrl",
                controllerAs: "vm",
                translations: ["app/account", "app/account/login"],
                authenticate: false,
                resolve : {
                    $title: function () {
                        return "Login to CDS";
                    }
                }
            });
    });
