"use strict";

/**
 * @ngdoc controller
 * @name cdsApp.controller:ProjectShowCtrl
 * @requires $rootScope, $scope, $state, $translate, $uibModal, CDSProjectVarRsc, CDSProjectGroupsRsc, CDSEnvRsc, CDSRepoManagerRsc, CDSSuggestVariableRsc, Project, ParameterService, Messaging, Permission, EditMode, Modal
 *
 * @description Manage show project view
 *
 */
angular.module("cdsApp").controller("ProjectShowCtrl", function ProjectAddCtrl (
    $rootScope, $q, $scope, $state, $translate, $uibModal,
    CDSProjectVarRsc, CDSProjectGroupsRsc, CDSProjectRsc,
    CDSEnvRsc, CDSRepoManagerRsc, CDSSuggestVariableRsc,
    Project, ParameterService, Messaging, Permission, EditMode, Warning, Modal) {

    var self = this;

    this.key = $state.params.key;

    // Project to show
    this.project = {};
    this.groups = [];
    this.audits = [];
    this.auditsChanges = false;
    this.auditsEnvChanges = false;
    this.environments = [];
    this.canEditProject = false;
    this.canEditEnvironment = false;
    this.selectedEnvAudit = "";
    this.selectedAuditVersion = "";
    this.listAuditForEnv = [];
    this.envFilter = "";
    this.edit = EditMode.get();

    // Repo managers
    this.repoManagers = [];
    this.newRepoManager = {};
    this.projectRepoManagers = [];

    this.tab = {};

    //auto suggest
    this.suggest = [];

    /**
     * @ngdoc function
     * @methodOf cdsApp.controller:ProjectShowCtrl
     * @name canWrite
     * @description Hide switch mode button if user cannot edit project
     */
    this.canWrite = function () {
        $rootScope.$broadcast("hideEditMode", !self.canEditProject);
    };

    /**
     * @ngdoc function
     * @methodOf cdsApp.controller:ProjectShowCtrl
     * @name canWriteEnv
     * @description Hide switch mode button if user cannot edit environment
     */
    this.canWriteEnv = function () {
        $rootScope.$broadcast("hideEditMode", !self.canEditEnvironment);
    };

    /**
     * @ngdoc function
     * @methodOf cdsApp.controller:ProjectShowCtrl
     * @name updateListeOfAudit
     * @description Liste all version of audit for the selected environment
     */
    this.updateListeOfAudit = function () {
        self.envFilter = self.selectedEnvAudit.name;
        CDSEnvRsc.audit({ key: $state.params.key, envName: self.envFilter }, function (data) {
            self.listAuditForEnv = [];
            self.listAuditForEnv.push({ id: 0, value: $translate.instant("parameter_management_audit_current") });
            self.selectedAuditVersion = self.listAuditForEnv[0];
            if (data) {
                data.forEach(function (a) {
                    self.listAuditForEnv.push({
                        id: a.id,
                        value: moment(a.versionned).format("YYYY/MM/DD HH:mm:ss") + " (" + a.author + ")",
                        variables: a.variables
                    });
                });
            }

        }, function (err) {
            Messaging.error(err);
        });
    };

    /**
     * @ngdoc function
     * @methodOf cdsApp.controller:ProjectShowCtrl
     * @name clearEnvFilter
     * @description Clear filters + reinit audit select
     */
    this.clearEnvFilter = function () {
        self.selectedEnvAudit = undefined;
        self.envFilter = undefined;
        self.selectedAuditVersion = undefined;
        self.listAuditForEnv = [];
    };

    /**
     * @ngdoc function
     * @methodOf cdsApp.controller:ProjectShowCtrl
     * @name updateSelectedEnvAudit
     * @description Set variable reference after select audit.
     */
    this.updateSelectedEnvAudit = function () {
        if (self.selectedAuditVersion.id !== 0) {
            self.envVarsOrigin = _.find(self.project.environments, { name: self.envFilter }).variables;
        }
    };

    /**
     * @ngdoc function
     * @methodOf cdsApp.controller:ProjectShowCtrl
     * @name restoreEnvAudit
     * @description Apply audit restoration
     */
    this.restoreEnvAudit = function () {
        return CDSEnvRsc.restoreAudit({ "key": $state.params.key, "envName": self.envFilter, auditId: self.selectedAuditVersion.id }, self.selectedAuditVersion.variables, function () {
            Project.invalidProject($state.params.key);
            return Project.getProject($state.params.key).then(function (data) {
                self.project = data;
                self.environments = angular.copy(self.project.environments);
                if (self.environments) {
                    self.environments.forEach(function (e) {
                        if (Permission.canWrite(e.permission)) {
                            self.canEditEnvironment = true;
                            e.canEdit = true;
                        }
                    });
                }
                self.initEnvData();
                self.updateListeOfAudit();
            });
        }, function (err) {
            Messaging.error(err);
            return $q.reject(err);
        }).$promise;
    };

    /**
     * @ngdoc function
     * @methodOf cdsApp.controller:ProjectShowCtrl
     * @name rename
     * @description Rename the project
     */
    this.rename = function () {
        var projectRenamed = {
            key: $state.params.key,
            name: self.project.name
        };
        if (!Project.existInCache(self.key)) {
            var modal = Modal.confirm.forceUpdate($translate.instant("common_project"));
            return modal.then(function () {
                return Project.update(projectRenamed).then(function (p) {
                    self.project = p;
                });
            }, function () {
                return $q.reject("Cancel");
            });
        } else {
            return Project.update(projectRenamed).then(function (p) {
                self.project = p;
            });
        }
    };

    /**
     * @ngdoc function
     * @methodOf cdsApp.controller:ProjectShowCtrl
     * @name deleteProject
     * @description Call API to delete the current project
     */
    this.deleteProject = function () {
        return Project.delete(self.project).then(function () {
            $rootScope.$broadcast("refreshSideBarEvent");
            $state.go("app.home");
        }).$promise;
    };

    /**
     * @ngdoc function
     * @methodOf cdsApp.controller:ProjectShowCtrl
     * @name initEnvData
     * @description Initialize env data to be able to build the table
     */
    this.initEnvData = function () {
        // Init all variables
        self.variables = [];

        // Init meta data for env variables
        if (self.environments) {

            // add all variables in self.variables : list of all variables in all env
            self.environments.forEach(function (e) {
                if (e.variables) {
                    e.variables.forEach(function (v) {
                        if (!_.find(self.variables, { "name": v.name })) {
                            self.variables.push(angular.copy(v));
                        }
                        // create metadata
                        v.meta = _.find(self.variables, { "name": v.name });
                    });
                }
            });

            if ($state.params.add) {
                if (!_.find(self.variables, { name : $state.params.add })) {
                    self.variables.push({
                        name: $state.params.add,
                        type: "string"
                    });
                }
            }

            // Add missing variables in env
            self.environments.forEach(function (env) {
                if (!env.variables) {
                    env.variables = [];
                }
                // browse all variables
                self.variables.forEach(function (v) {
                    // if not in current env, add it
                    if (!_.find(env.variables, { "name": v.name })) {
                        env.variables.push({ "value": "", "meta": v });
                    }
                });
            });
        }
    };

    /**
     * @ngdoc function
     * @methodOf cdsApp.controller:ProjectShowCtrl
     * @name deleteEnvironment
     * @description Call API to delete an environment
     */
    this.deleteEnvironment = function (env, index) {
        CDSEnvRsc.delete({ "key": $state.params.key, "envName": env.name }, function (p) {
            Project.deleteCacheEnv(p, env.name).then(function (p) {
                self.project = p;
                self.environments.splice(index, 1);
            });
        }, function (err) {
            Messaging.error(err);
        });
    };

    this.saveGroups = function () {
        if (!Project.existInCache(self.key)) {
            var modal = Modal.confirm.forceUpdate($translate.instant("common_project"));
            return modal.then(function () {
                return self.updatePermissions();
            }, function () {
                return $q.reject("Cancel");
            });
        } else {
            return self.updatePermissions();
        }
    };

    this.updatePermissions = function () {
        return CDSProjectGroupsRsc.update({ "key": $state.params.key }, self.groups, function () {
            self.project.groups = angular.copy(self.groups);
            Project.invalidProject($state.params.key);
            return Project.getProject($state.params.key).then(function (project) {
                self.project = project;
            });
        }, function (err) {
            Messaging.error(err);
            self.groups = angular.copy(self.project.groups);
            return $q.reject(err);
        }).$promise;
    };

    /**
     * @ngdoc function
     * @methodOf cdsApp.controller:ProjectShowCtrl
     * @name saveEnvironments
     * @description Call API to save environments data
     */
    this.saveEnvironments = function () {
        var envs = [];
        if (_.isArray(this.environments)) {
            envs = this.environments.map(function (env) {
                var e = angular.copy(env);
                e.variables = env.variables.map(function (v) {
                    return {
                        id: v.id,
                        name: v.meta.name,
                        type: v.meta.type,
                        value: v.value.toString()
                    };
                });
                return e;
            });
        }
        if (!Project.existInCache(self.key)) {
            var modal = Modal.confirm.forceUpdate($translate.instant("common_project"));
            return modal.then(function () {
                return self.updateEnvs(envs);
            }, function () {
                return $q.reject("Cancel");
            });
        } else {
            return self.updateEnvs(envs);
        }

    };

    this.updateEnvs = function (envs) {
        return CDSEnvRsc.update({ "key": $state.params.key }, envs, function (data) {
            Project.updateCacheEnvs(data).then(function (p) {
                self.project = p;
                self.environments = angular.copy(self.project.environments);
                if (self.environments) {
                    self.environments.forEach(function (e) {
                        if (Permission.canWrite(e.permission)) {
                            self.canEditEnvironment = true;
                            e.canEdit = true;
                        }
                    });
                }
                if (self.canEditProject) {
                    self.canEditEnvironment = true;
                }
                self.initEnvData();
            });
            $state.go("app.project-show", { "key": $state.params.key, "tab": $state.params.tab, "add": "" }, { notify: false });
        }, function (err) {
            Messaging.error(err);
            return $q.reject(err);
        }).$promise;
    };

    /**
     * @ngdoc function
     * @methodOf cdsApp.controller:ProjectShowCtrl
     * @name saveVariables
     * @description Call API to save all variables
     */
    this.saveVariables = function () {
        self.project.variables = ParameterService.format(self.project.variables);
        if (!Project.existInCache(self.key)) {
            var modal = Modal.confirm.forceUpdate($translate.instant("common_project"));
            return modal.then(function () {
                return self.updateVariables();
            }, function () {
                return $q.reject("Cancel");
            });
        } else {
            return self.updateVariables();
        }
    };

    this.updateVariables = function () {
        return CDSProjectVarRsc.update({ "key": $state.params.key }, self.project.variables, function () {
            Project.invalidProject($state.params.key);
            return Project.getProject($state.params.key).then(function (project) {
                self.project = project;
                self.loadAudit();
            });
        }, function (err) {
            Messaging.error(err);
            return $q.reject(err);
        }).$promise;
    };

    this.loadSuggest = function () {
        CDSSuggestVariableRsc.query({ "key" : self.key }, function (data) {
            self.suggest = data;
        });
    };

    this.loadProject = function (tab) {
        Project.getProject($state.params.key).then(function (data) {
            self.project = data;
            $rootScope.$broadcast("select-project", { project: data });
            self.groups = angular.copy(self.project.groups);
            self.canEditProject = Permission.canWrite(self.project.permission);
            self.canEditEnvironment = false;
            self.environments = angular.copy(self.project.environments);
            if (self.environments) {
                self.environments.forEach(function (e) {
                    if (Permission.canWrite(e.permission)) {
                        self.canEditEnvironment = true;
                        e.canEdit = true;
                    }
                });
            }
            if (self.canEditProject) {
                self.canEditEnvironment = true;
            }

            switch (tab) {
                case "environment":
                    self.initEnvData();
                    self.canWriteEnv();
                    break;
                default :
                    self.canWrite();
                    break;
            }
        });
    };

    /**
     * @ngdoc function
     * @methodOf cdsApp.controller:ProjectShowCtrl
     * @name selectTab
     * @description Select tab
     */
    this.selectTab = function (tab) {
        self.loadProject(tab);
        switch (tab) {
            case "application":
                self.tab.active = 0;
                break;
            case "pipeline":
                self.tab.active = 1;
                break;
            case "environment":
                self.loadSuggest();
                self.tab.active = 2;
                break;
            case "parameter":
                self.loadAudit();
                self.loadSuggest();
                self.tab.active = 3;
                break;
            case "group":
                self.tab.active = 4;
                break;
            case "advanced":
                self.loadAllRepoManager();
                self.loaddRepoManagerForProject();
                self.tab.active = 5;
                break;
        }
        $state.go("app.project-show", { "key": $state.params.key, "tab": tab }, { notify: false, reload: false });
    };

    this.loadAllRepoManager = function () {
        CDSRepoManagerRsc.query(function (data) {
            self.repoManagers = data;
            if (self.repoManagers.length > 0) {
                self.newRepoManager = data[0];
            }
        }, function (err) {
            Messaging.error(err);
        });
    };

    this.loaddRepoManagerForProject = function () {
        CDSRepoManagerRsc.getByProject({ "key": $state.params.key }, function (data) {
            self.projectRepoManagers = data;
        }, function (err) {
            Messaging.error(err);
        });
    };

    this.addRepoManager = function () {
        if (!Project.existInCache(self.key)) {
            var modal = Modal.confirm.forceUpdate($translate.instant("common_project"));
            return modal.then(function () {
                return self.addNewRepositoryManager();
            }, function () {
                return $q.reject("Cancel");
            });
        } else {
            return self.addNewRepositoryManager();
        }
    };

    this.addNewRepositoryManager = function () {
        return CDSRepoManagerRsc.link({ "key": $state.params.key, "repoManName": self.newRepoManager.name }, self.newRepoManager, function (data) {
            if (data) {
                var urlVerify = data.url;
                var requestToken = data.request_token;
                var modal = $uibModal.open({
                    animation: true,
                    size: "lg",
                    templateUrl: "app/project/show/modal/verify/verify.html",
                    controller: "ProjectShowVerifyCtrl",
                    controllerAs : "ctrl",
                    resolve: {
                        url: function () {
                            return urlVerify;
                        },
                        repoManager: function () {
                            return self.newRepoManager.name;
                        },
                        token: function () {
                            return requestToken;
                        }
                    }
                });
                modal.result.then(function () {
                    Messaging.success($translate.instant("project_show_message_get_linked"));
                    self.loaddRepoManagerForProject();
                });
            }
        }, function (err) {
            Messaging.error(err);
            return $q.reject(err);
        }).$promise;
    };

    this.loadAudit = function () {
        CDSProjectRsc.audit({ key: $state.params.key }, function (data) {
            self.audits = data;
            self.initSelectAudit();
        }, function (err) {
            Messaging.error(err);
        });
    };

    this.initSelectAudit = function () {
        this.auditSelect = [];
        this.auditSelect.push({ id: 0, value: $translate.instant("parameter_management_audit_current") });
        this.selectedAudit = self.auditSelect[0];
        if (self.audits) {
            self.audits.forEach(function (a) {
                self.auditSelect.push({
                    id: a.id,
                    value: moment(a.versionned).format("YYYY/MM/DD HH:mm:ss") + " (" + a.author + ")"
                });
            });
        }

    };

    this.restoreAudit = function () {
        return CDSProjectRsc.restoreAudit({ key: $state.params.key, auditId:  self.selectedAudit.id }, {}, function () {
            Project.invalidProject($state.params.key);
            return Project.getProject($state.params.key).then(function (p) {
                self.project = p;
                self.loadAudit();
            });
        }, function (err) {
            Messaging.error(err);
        });
    };

    this.updateSelectedAudit = function () {
        if (self.selectedAudit.id !== 0) {
            self.varsAudited = _.find(self.audits, { id: self.selectedAudit.id }).variables;
        }

    };

    this.init = function () {
        switch ($state.params.tab) {
            case "application":
                self.tab.active = 0;
                break;
            case "pipeline":
                self.tab.active = 1;
                break;
            case "environment":
                self.tab.active = 2;
                break;
            case "parameter":
                self.tab.active = 3;
                break;
            case "group":
                self.tab.active = 4;
                break;
            case "advanced":
                self.tab.active = 5;
                break;
        }
        self.projectWarning = Warning.getProjectWarning(self.key);
        this.initSelectAudit();
    };

    this.init();

    $scope.$on("refresh-project", function () {
        self.loadProject($state.params.tab);
        self.project = Project.getProject(self.key);
    });

    $scope.$on("refresh-warning-data", function () {
        self.projectWarning = Warning.getProjectWarning(self.key);
    });

    $scope.$on("editModeStateEvent", function (event, args) {
        self.edit = args;
    });
});
