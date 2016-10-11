"use strict";

angular.module("cdsApp").component("breadcrumbs", {
    bindings: {
        key: "@",
        projectname: "@",
        appname: "@",
        pipname: "@",
        actionname: "@",
        trigger: "@",
        repomanager: "@",
        repo: "@",
        applications: "="
    },
    controllerAs: "ctrl",
    controller: function ($scope, CDSRepoManagerRsc, Messaging) {

        var self = this;
        this.subtitle = "";

        $scope.$watch(function () {
            return [self.appname, self.key, self.repomanager, self.repo];
        }, function () {
            if (self.subtitle === "" && !!self.appname && !!self.key && !!self.repomanager && !!self.repo) {
                self.loadRepo();
            }
        }, true);

        this.loadRepo = function () {
            CDSRepoManagerRsc.repo({ "key": self.key, "repoManName": self.repomanager, "repo": self.repo }, function (data) {
                self.subtitle = data.url;
            }, function (err) {
                Messaging.error(err);
            });
        };

    },
    templateUrl: "components/breadcrumbs/breadcrumbs.html"
});
