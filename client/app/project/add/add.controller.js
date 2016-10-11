"use strict";

/**
 * @ngdoc controller
 * @name cdsApp.controller:ProjectAddCtrl
 * @requires CDSProjectsRsc
 *
 * @description Manage project creation page
 *
 */
angular.module("cdsApp").controller("ProjectAddCtrl", function ProjectAddCtrl ($q, $rootScope, $state, CDSProjectsRsc, Messaging, $translate, ParameterService, EditMode) {

    var self = this;
    this.project = {
        application : {}
    };

    /**
     * @ngdoc function
     * @methodOf cdsApp.controller:ProjectAddCtrl
     * @name createProject
     * @description Call API to create the project
     */
    this.createProject = function () {
        // Remove env if no deployment
        if (!this.project.hasDeployment) {
            this.project.environments = null;
        } else if (this.project.environments) {
            this.project.environments.forEach(function (env) {
                if (env.variables) {
                    // Remove variable meta
                    env.variables.map(function (v, i) {
                        if (v.meta) {
                            env.variables[i] = {
                                "name": v.meta.name,
                                "type": v.meta.type,
                                "value": v.value.toString()
                            };
                        }
                    });
                }
            });
        }

        if (this.project.application.buildTemplate && this.project.application.buildTemplate.params) {
            this.project.application.buildTemplate.params = ParameterService.format(this.project.application.buildTemplate.params);
        }
        if (this.project.application.deployTemplate && this.project.application.deployTemplate.params) {
            this.project.application.deployTemplate.params = ParameterService.format(this.project.application.deployTemplate.params);
        }
        if (this.project.application.variables) {
            this.project.application.variables = ParameterService.format(this.project.application.variables);
        }

        this.project.applications = [];
        if (this.project.application.name) {
            this.project.applications.push(this.project.application);
        }

        // Call api to create the project
        return CDSProjectsRsc.create(this.project, function () {
            $rootScope.$broadcast("refreshSideBarEvent");
            $state.go("app.project-show", { "key": self.project.key });
        }, function (err) {
            Messaging.error(err);
            return $q.reject(err);
        }).$promise;
    };

    this.init = function () {
        EditMode.switchOn();
    };
    self.init();
});
