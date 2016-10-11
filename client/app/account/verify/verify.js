"use strict";

angular.module("cdsApp")
    .config(function ($stateProvider) {
        $stateProvider
            .state("verify", {
                url: "/verify/:username/:token",
                templateUrl: "app/account/verify/verify.html",
                controller: "VerifyCtrl",
                controllerAs: "vm",
                translations: ["app/account/verify"],
                authenticate: false
            });
    });
