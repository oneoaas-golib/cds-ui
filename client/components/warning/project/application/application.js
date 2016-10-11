"use strict";

angular.module("cdsApp").component("warningApplication", {
    bindings: {
        warning: "=",
        key: "@",
        appname: "@",
        showaction: "@"
    },
    controllerAs: "ctrl",
    controller: function () {
    },
    templateUrl: "components/warning/project/application/application.html"
});
