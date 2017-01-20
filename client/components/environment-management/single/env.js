"use strict";

angular.module("cdsApp").component("environmentManagementSingle", {
    bindings: {
        "env": "=",
        "project" : "="
    },
    controllerAs: "ctrl",
    controller: function ($q, $state, $scope, $translate, EditMode, CDSVariablesTypeRsc, CDSEnvRsc, Messaging, Project) {
        var self = this;
        this.edit = EditMode.get();
        this.newVar = {};


        /**
         * @ngdoc function
         * @name getDataType
         * @description Get from API all types of parameter
         */
        this.getDataType = function () {
            CDSVariablesTypeRsc.query(function (data) {
                self.types = data;
            }, function (err) {
                Messaging.error(err);
            });
        };

        this.deleteEnv = function() {
            return CDSEnvRsc.delete({"key": self.project.key, "envName": self.env.name}, function (data) {
                Messaging.success($translate.instant('env_deleted'));
                self.env = {};
                return Project.updateCacheAllEnv(data).then(function (p) {
                   self.project = p;
                });
            }, function(err) {
                Messaging.error(err);
            });
        };

        this.updateVar = function (v) {
            v.value = v.value.toString();
            return CDSEnvRsc.updateVar({"key": self.project.key, "envName": self.env.name, "varName": v.name }, v, function (data) {
                self.env = _.find(data.environments, function (e) {
                    return e.id === self.env.id;
                });
                Messaging.success($translate.instant('env_var_updated'));
                return Project.updateCacheAllEnv(data).then(function (p) {
                    self.project = p;
                });
            }, function (err) {
                Messaging.error(err);
                return $q.reject(err);
            });
        };

        this.deleteVar = function (v) {
            v.value = v.value.toString();
            return CDSEnvRsc.deleteVar({"key": self.project.key, "envName": self.env.name, "varName": v.name }, function (data) {
                self.env = _.find(data.environments, function (e) {
                    return e.id === self.env.id;
                });
                Messaging.success($translate.instant('env_var_deleted'));
                return Project.updateCacheAllEnv(data).then(function (p) {
                    self.project = p;
                });
            }, function (err) {
                Messaging.error(err);
                return $q.reject(err);
            });
        };

        this.addVar = function () {
            this.newVar.value = this.newVar.value.toString();
            return CDSEnvRsc.addVar({"key": self.project.key, "envName": self.env.name, "varName": this.newVar.name }, this.newVar, function (data) {
                self.env = _.find(data.environments, function (e) {
                   return e.id === self.env.id;
                });
                self.newVar = {};
                Messaging.success($translate.instant('env_var_added'));
                return Project.updateCacheAllEnv(data).then(function (p) {
                    self.project = p;
                });
            }, function (err) {
                Messaging.error(err);
                return $q.reject(err);
            });
        };

        this.init = function () {
            self.getDataType();
            if ($state.params.add) {
                self.varFilter = $state.params.add;
            }
        };
        this.init();

        $scope.$on("editModeStateEvent", function (event, args) {
            self.edit = args;
        });
    },
    templateUrl: "components/environment-management/single/env.html"
});
