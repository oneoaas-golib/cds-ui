"use strict";

angular.module("cdsApp")
    .config(function ($stateProvider) {
        $stateProvider
            .state("password", {
                url: "/password",
                templateUrl: "app/account/password/password.html",
                controller: "PasswordCtrl",
                controllerAs: "vm",
                translations: ["app/account", "app/account/password"],
                authenticate: false
            });
    });
