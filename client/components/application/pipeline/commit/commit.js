"use strict";

angular.module("cdsApp").component("applicationPipelineCommits", {
    bindings: {
        commits: "=",
        urlrepo: "@"
    },
    controllerAs: "ctrl",
    controller: function ($translate, $sce) {

        this.getGitID = function (id) {
            return id.substr(0, 11);
        };

        this.trustAsHtml = function (string) {
            return $sce.trustAsHtml(string);
        };
    },
    templateUrl: "components/application/pipeline/commit/commit.html"
});
