"use strict";

angular.module("cdsApp").component("pipelineStatus", {
    bindings: {
        status : "=",
        msg: "@",
        click: "&"
    },
    controllerAs: "ctrl",
    controller: function () {

    },
    templateUrl: "components/pipeline-status/pipelineStatus.html"
});
