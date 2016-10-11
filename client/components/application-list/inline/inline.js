"use strict";

angular.module("cdsApp").component("applicationListInline", {
    bindings: {
        pipeline: "="
    },
    controllerAs: "ctrl",
    controller: function ($scope, $translate, CDSPipelineRsc, Messaging) {
        var self = this;
        self.applications = [];

        $scope.$watch(function () {
            return self.pipeline;
        }, function (newValue) {
            if (newValue && newValue.name && self.applications.length === 0) {
                self.loadApplications();
            }
        }, true);

        this.loadApplications = function () {
            CDSPipelineRsc.getApplications({ "key": self.pipeline.projectKey, "pipName": self.pipeline.name }, function (data) {
                self.applications = data;
            }, function (err) {
                Messaging.error(err);
            });
        };
    },
    templateUrl: "components/application-list/inline/inline.html"
});
