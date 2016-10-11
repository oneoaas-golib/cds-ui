"use strict";

angular.module("cdsApp").component("environmentManagementPermission", {
    bindings: {
        envs: "=",
        project: "="
    },
    controllerAs: "ctrl",
    controller: function ($q, $state, $scope, $translate, Messaging, EditMode, CDSGroupsRsc, CDSEnvRsc, Project, Modal) {
        var self = this;
        this.key = $state.params.key;
        this.edit = EditMode.get();
        this.selected = {
            envs: [],
            groups: [],
            permission: 4
        };

        /**
         * @ngdoc function
         * @name loadExistingGroups
         * @description Call API to get all existing groups
         */
        this.loadExistingGroups = function () {
            CDSGroupsRsc.query(function (data) {
                self.existingGroups = data;
            }, function (err) {
                Messaging.error(err);
            });
        };

        this.removeGroup = function (env, index) {
            env.groups.splice(index, 1);
        };

        this.save = function () {
            if (!Project.existInCache(self.key)) {
                var modal = Modal.confirm.forceUpdate($translate.instant("common_project"));
                return modal.then(function () {
                    return self.updateEnvironments();
                }, function () {
                    return $q.reject("Cancel");
                });
            } else {
                return self.updateEnvironments();
            }

        };

        this.updateEnvironments = function () {
            return CDSEnvRsc.update({ "key": $state.params.key }, self.envs, function () {
                self.project.environments = angular.copy(self.envs);
                Project.invalidProject($state.params.key);
                return Project.getProject($state.params.key).then(function (p) {
                    self.project = p;
                });
            }, function (err) {
                Messaging.error(err);
                self.envs = angular.copy(self.project.environments);
                return $q.reject(err);
            }).$promise;
        };

        this.addGroups = function () {
            if (self.selected.groups.length > 0 && self.selected.envs.length > 0) {
                self.envs.forEach(function (e) {
                    if (_.find(self.selected.envs, function (senv) {
                            return e.name === senv;
                        })) {
                        self.selected.groups.forEach(function (g) {
                            if (!_.find(e.groups, { "group": { "name": g } })) {
                                if (!e.groups) {
                                    e.groups = [];
                                }
                                e.groups.push({
                                    group: {
                                        name : g
                                    },
                                    permission: self.selected.permission
                                });
                            }
                        });

                    }
                });
            }
        };

        function initTranslations () {
            self.loadingTranslations = true;
            $translate.refresh().then(function () {
                self.permissions = [
                    { "name": $translate.instant("group_management_permission_read"), "value": 4 },
                    { "name": $translate.instant("group_management_permission_read_execute"), "value": 5 },
                    { "name": $translate.instant("group_management_permission_read_write_execute"), "value": 7 }
                ];
                self.selected.permission = 4;
                self.loadingTranslations = false;
            });
        }

        this.getPermissionName = function (id) {
            if (self.permissions && self.permissions.length > 0) {
                return _.find(self.permissions, { "value": id }).name;
            }
            return "";
        };

        this.init = function () {
            initTranslations();
            this.loadExistingGroups();
        };
        this.init();

        $scope.$on("editModeStateEvent", function (event, args) {
            self.edit = args;
        });
    },
    templateUrl: "components/environment-management/permission/permission.html"
});
