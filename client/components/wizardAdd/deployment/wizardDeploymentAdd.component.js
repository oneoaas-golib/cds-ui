"use strict";

angular.module("cdsApp").component("wizardDeploymentAdd", {
    bindings: {
        project: "=",
        done: "&",
        buttontitle: "@"
    },
    controllerAs: "wz",
    controller: function ($translate, Messaging, CDSTemplateDeploy) {
        var self = this;

        // List of build templates
        this.templates = [];
        this.variables = [];

        this.checkDeployTemplate = function () {
            if (!self.project.hasDeployment)  {
                delete self.project.application.deployTemplate;
            }
        };

        /**
         * @ngdoc function
         * @name submit
         * @description Submit form
         */
        this.submit = function submit (form) {
            this.submitted = true;
            if (form.$valid) {
                self.done();
            }
        };

        /**
         * @ngdoc function
         * @name getDeployTemplate
         * @description Get from API all deployment template
         */
        this.getDeployTemplate = function () {
            CDSTemplateDeploy.query(function (data) {
                self.templates = data;
            }, function (err) {
                Messaging.error(err);
            });
        };

        this.init = function () {
            self.getDeployTemplate();
        };
        this.init();
    },

    templateUrl: "components/wizardAdd/deployment/wizardDeploymentAdd.html"
});
