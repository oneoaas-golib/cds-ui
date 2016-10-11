"use strict";

angular.module("cdsApp")
    .config(function ($stateProvider) {
        $stateProvider
            .state("waiting", {
                url: "/waiting",
                templateUrl: "app/account/waiting/waiting.html",
                controller: "WaitingCtrl",
                controllerAs: "vm",
                translations: ["app/account/waiting"],
                authenticate: false
            });

    });
