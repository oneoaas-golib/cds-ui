"use strict";

angular.module("cdsApp").component("warningProject", {
    bindings: {
        warning: "=",
        key: "@"
    },
    controllerAs: "ctrl",
    controller: function () {
    },
    templateUrl: "components/warning/project/project.html"
});
