"use strict";

angular.module("cdsApp")
    .config(function ($stateProvider) {
        $stateProvider
            .state("signup", {
                url: "/signup",
                templateUrl: "app/account/signup/signup.html",
                controller: "SignupCtrl",
                controllerAs: "vm",
                translations: ["app/account", "app/account/signup"],
                authenticate: false
            });
    });
