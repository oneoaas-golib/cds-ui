"use strict";

angular.module("cdsApp").component("environmentManagement", {
    bindings: {
        envs: "=",
        project: "=",
        variables: "=",
        save: "&",
        delete: "&",
        groups: "=",
        projectwrite: "@",
        filter: "@"
    },
    controllerAs: "ctrl",
    controller: function ($q, $state, $attrs, $translate, $scope, CDSVariablesTypeRsc, Messaging, EditMode, CDSEnvRsc, Project, Modal) {
        var self = this;

        this.types = [];
        this.edit = EditMode.get();
        this.key = $state.params.key;

        $scope.$watch(function () {
            return self.filter;
        }, function () {
            self.disabledFilter = self.filter === "";
        }, true);

        this.saveEnvs = function () {
            // All env at once
            if (self.projectwrite === "true" && self.envs && self.envs.length === self.countEnv()) {
                return self.save();
            } else {
                if (!Project.existInCache(self.key)) {
                    var modal = Modal.confirm.forceUpdate($translate.instant("common_project"));
                    return modal.then(function () {
                        return self.updateOneEnv();
                    }, function () {
                        return $q.reject("Cancel");
                    });
                } else {
                    return self.updateOneEnv();
                }

            }
        };

        this.updateOneEnv = function () {
            // Env by env
            if (self.envs) {
                var env = _.find(self.envs,  { name: self.filter });
                if (env && env.canEdit) {
                    return CDSEnvRsc.update({ "key": $state.params.key, "envName": env.name }, env, function (data) {
                        Project.updateCacheEnv(data).then(function (p) {
                            self.project = p;
                        });
                    }, function (err) {
                        Messaging.error(err);
                        return $q.reject(err);
                    }).$promise;
                }
            }
        };

        this.canSave = function () {
            // If user can update all env
            if (self.envs && self.envs.length === self.countEnv()) {
                return $attrs.save;
            } else {
                var canSave = false;
                if (self.envs) {
                    self.envs.forEach(function (e) {
                        if (e.canEdit) {
                            canSave = true;
                        }
                    });
                }
                return canSave;
            }
        };

        /**
         * @ngdoc function
         * @name addEnv
         * @description Add new environment and set all variables
         */
        this.addEnv = function () {
            if (!self.envs) {
                self.envs = [];
            }
            var envName = "";
            switch (self.envs.length) {
                case 0 :
                    envName = "production";
                    break;
                case 1 :
                    envName = "preproduction";
                    break;
                default :
                    envName = "";
            }
            var newEnv = {
                "name": envName,
                variables: [],
                groups: angular.copy(self.groups),
                canEdit: true
            };

            if (self.variables) {
                self.variables.forEach(function (v) {
                    newEnv.variables.push({
                        "value": "",
                        "meta": v
                    });
                });
            }
            self.envs.push(newEnv);
        };

        this.countEnv = function () {
            var count = 0;
            if (self.envs) {
                self.envs.forEach(function (e) {
                    if ((self.edit && e.canEdit) || !self.edit) {
                        if (!self.filter || e.name === self.filter) {
                            count++;
                        }
                    }
                });
            }
            return count;
        };

        this.listEnv = function (item) {
            return (self.edit && item.canEdit) || !self.edit;
        };

        /**
         * @ngdoc function
         * @name getVariable
         * @description Get variable in the given env
         */
        this.getVariable = function (env, v) {
            if (_.find(env.variables, { "name": v.name })) {
                return _.find(env.variables, { "name": v.name });
            } else {
                return _.find(env.variables, { meta: { "name": v.name } });
            }

        };

        /**
         * @ngdoc function
         * @name deleteEnv
         * @description Delete an environments
         */
        this.deleteEnv = function (env, index) {
            self.delete({ ENV: env, INDEX: index });
        };

        /**
         * @ngdoc function
         * @name addVariable
         * @description Add variable on all environment
         */
        this.addVariable = function (v) {
            if (!v) {
                v = { "name": "var_" + self.variables.length, type: "string", value: "" };
            }
            self.variables.push(v);
            self.envs.forEach(function (env) {
                if (!env.variables) {
                    env.variables = [];
                }
                env.variables.push({
                    "value": "",
                    "meta": self.variables[self.variables.length - 1]
                });
            });
        };

        /**
         * @ngdoc function
         * @name deleteVariable
         * @description Delete variable
         */
        this.deleteVariable = function (v, index) {
            self.variables.splice(index, 1);
            self.envs.forEach(function (env) {
                _.remove(env.variables, function (va) {
                    return v.name === va.meta.name;
                });
            });
        };

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

        /**
         * @ngdoc function
         * @name getEnvVariable
         * @description Get env variable by name
         */
        this.getEnvVariable = function (varList, variable) {
            return _.find(varList, { name : variable.name });
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
    templateUrl: "components/environment-management/env.html"
});
