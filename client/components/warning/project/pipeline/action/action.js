"use strict";

angular.module("cdsApp").component("warningAction", {
    bindings: {
        warning: "=",
        key: "@"
    },
    controllerAs: "ctrl",
    controller: function ($q, $rootScope, WARNING_TYPE, CDSVariablesTypeRsc, CDSApplicationVarRsc, CDSProjectVarRsc, Messaging, $translate, Application, Project) {

        var self = this;

        this.isMissingVar = function (warningID) {
            switch (warningID) {
                case WARNING_TYPE.ApplicationVariableDoesNotExist:
                case WARNING_TYPE.ProjectVariableDoesNotExist:
                    return true;
                default:
                    return false;
            }
        };

        this.missingEnvVar = function (warningID) {
            return warningID === WARNING_TYPE.EnvironmentVariableDoesNotExist;
        };

        this.createVar = function (warning) {
            warning.newVar.value = warning.newVar.value.toString();
            switch (warning.id) {
                case WARNING_TYPE.ApplicationVariableDoesNotExist:
                    return CDSApplicationVarRsc.save({ "key": self.key, "appName": warning.application.name, "varName": warning.newVar.name }, warning.newVar,
                        function () {
                            Messaging.success($translate.instant("warning_action_variable_saved"));
                            Application.invalidApplication(self.key, warning.application.name);
                            Application.getApplication(self.key, warning.application.name).then(function () {
                                $rootScope.$broadcast("refresh-application");
                            });
                        }, function (err) {
                            Messaging.error(err);
                            return $q.reject(err);
                        }).$promise;
                case WARNING_TYPE.ProjectVariableDoesNotExist:
                    return CDSProjectVarRsc.save({ "key": self.key, "varName": warning.newVar.name }, warning.newVar,
                        function () {
                            Messaging.success($translate.instant("warning_action_variable_saved"));
                            Project.invalidProject(self.key);
                            Project.getProject(self.key).then(function () {
                                $rootScope.$broadcast("refresh-project");
                            });
                        }, function (err) {
                            Messaging.error(err);
                            return $q.reject(err);
                        }).$promise;
            }
            return $q.reject("Unknown button");
        };

        this.init = function () {
            CDSVariablesTypeRsc.query(function (data) {
                self.types = data;
            }, function (err) {
                Messaging.error(err);
            });
        };
        this.init();
    },
    templateUrl: "components/warning/project/pipeline/action/action.html"
});
