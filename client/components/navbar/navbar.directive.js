"use strict";

angular.module("cdsApp")
.directive("navbar", function () {
    return {
        restrict: "AE",
        scope: {},
        templateUrl: "components/navbar/navbar.html",
        controller: "NavbarCtrl",
        controllerAs: "navbar"
    };
});
