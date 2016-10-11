"use strict";

angular.module("cdsApp").component("warningPipeline", {
    bindings: {
        warning: "=",
        key: "@",
        pipname: "@"
    },
    controllerAs: "ctrl",
    controller: function () {
    },
    templateUrl: "components/warning/project/pipeline/pipeline.html"
});
