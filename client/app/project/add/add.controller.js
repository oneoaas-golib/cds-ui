"use strict";

/**
 * @ngdoc controller
 * @name cdsApp.controller:ProjectAddCtrl
 * @requires CDSProjectsRsc
 *
 * @description Manage project creation page
 *
 */
angular.module("cdsApp").controller("ProjectAddCtrl", function ProjectAddCtrl ($q, $rootScope, $state, CDSProjectsRsc, Messaging, $translate, ParameterService, EditMode, $location) {

    var self = this;
    this.project = {};

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

    this.checkGroups = function () {
        if (self.project.groups && self.project.groups.length > 0) {
            for (var i = 0; i < self.project.groups.length; i++) {
                if (!self.project.groups[i].group.name || self.project.groups[i].group.name === "") {
                    return false;
                }
            }
            return true;
        }
        return false;
    };

    this.keyPattern = new RegExp("^[A-Z0-9]*$");

    /**
     * @ngdoc function
     * @name generateKey
     * @description Auto generate project key from project name
     *
     * Auto generate project key from project name
     */
    this.generateKey = function () {
        if (!self.project.name) {
            return;
        }
        if (self.project.key === undefined) {
            self.project.key = "";
        }
        if (self.project.key.length >= 5) {
            return;
        }
        self.project.key = self.project.name.toUpperCase();
        self.project.key = self.project.key.replace(/([.,; *`§%&#_\-'+?^=!:$\\"{}()|\[\]\/\\])/g, "").substr(0, 5);
    };

    /**
     * @ngdoc function
     * @name getUrl
     * @description Get current URL
     */
    this.getUrl = function () {
        return $location.absUrl() + "/";
    };

    this.submit = function submit (form) {
        self.submitted = true;

        if (form.$valid && self.checkGroups()) {
            self.createProject();
        }
    };

});
