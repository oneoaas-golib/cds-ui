"use strict";

angular.module("cdsApp").component("warningEnvironment", {
    bindings: {
        warning: "=",
        key: "@",
        envname: "@"
    },
    controllerAs: "ctrl",
    controller: function () {
    },
    templateUrl: "components/warning/project/environment/environment.html"
});
