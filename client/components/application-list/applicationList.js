"use strict";

angular.module("cdsApp").component("applicationList", {
    bindings: {
        project: "="
    },
    controllerAs: "ctrl",
    controller: function ($rootScope, $state, $translate, CDSTemplateProjectRsc, Messaging, ParameterService, Permission) {
        var self = this;
        this.key = $state.params.key;
        this.newApp = {};

        this.canWrite = function () {
            return Permission.canWrite(self.project.permission);
        };
    },
    templateUrl: "components/application-list/applicationList.html"
});
