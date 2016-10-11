"use strict";

/**
 * @ngdoc controller
 * @name cdsApp.controller:ApplicationAddCtrl
 * @requires Project, $rootScope, $state, Messaging, CDSTemplateProjectRsc, CDSApplicationCloneRsc, ParameterService
 *
 * @description Add a new application
 *
 */
angular.module("cdsApp").controller("ApplicationAddCtrl", function ApplicationShowCtrl ($translate, $q, Project, $rootScope, $state, Messaging, CDSRepoManagerRsc, CDSTemplateProjectRsc, CDSApplicationCloneRsc, ParameterService, Modal) {
    var self = this;
    this.key = $state.params.key;
    this.newApp = {};

    this.createApplication = function () {
        if (!Project.existInCache(self.key)) {
            var modal = Modal.confirm.forceUpdate($translate.instant("common_project"));
            return modal.then(function () {
                return self.addApplication();
            }, function () {
                return $q.reject("Cancel");
            });
        }
        return self.addApplication();
    };

    this.addApplication = function () {
        // format parameters to string
        if (self.newApp.variables) {
            self.newApp.variables = ParameterService.format(self.newApp.variables);
        }

        if (self.newApp.type === "template") {
            if (self.newApp.buildTemplate && self.newApp.buildTemplate.params) {
                self.newApp.buildTemplate.params = ParameterService.format(self.newApp.buildTemplate.params);
            }
            return CDSTemplateProjectRsc.save({ "key": self.key }, self.newApp, function () {
                $rootScope.$broadcast("refreshSideBarEvent");
                Project.invalidProject(self.key);
                Project.getProject(self.key);
                $state.go("app.application-show", { "key": self.key, "appName": self.newApp.name });
            }, function (err) {
                Messaging.error(err);
                return $q.reject(err);
            }).$promise;
        } else if (self.newApp.type === "clone") {
            return CDSApplicationCloneRsc.save({ "key": self.key, "appName": self.newApp.cloneApplication.name }, self.newApp, function () {
                $rootScope.$broadcast("refreshSideBarEvent");
                Project.invalidProject(self.key);
                Project.getProject(self.key);
                $state.go("app.application-show", { "key": self.key, "appName": self.newApp.name });
            }, function (err) {
                Messaging.error(err);
                return $q.reject(err);
            }).$promise;
        }
    };

    this.loadProject = function () {
        Project.getProject($state.params.key).then(function (data) {
            self.project = data;
        });
    };

    this.loadRepoManagerForProject = function () {
        CDSRepoManagerRsc.getByProject({ "key": $state.params.key }, function (data) {
            self.projectRepoManagers = data;
        }, function (err) {
            Messaging.error(err);
        });
    };

    this.init = function () {
        self.loadProject();
        self.loadRepoManagerForProject();
    };
    self.init();
});
