"use strict";

angular.module("cdsApp").component("triggerManagement", {
    bindings: {
        trigger: "=",
        project: "=",
        done: "&"
    },
    controllerAs: "ctrl",
    controller: function ($q, $scope, $translate, Application, $state, ParameterService, CDSSuggestVariableRsc) {
        var self = this;
        this.key = $state.params.key;
        this.pipelineList = [];
        this.suggest = [];

        $scope.$watch(function () {
            return self.project;
        }, function (newValue, old) {
            if (!old.key && newValue.key && self.trigger.id) {
                self.initTriggerSelection();
            }
        }, true);

        $scope.$watch(function () {
            return self.trigger;
        }, function (newValue, old) {
            if (!old.id && newValue.id && self.project.key) {
                self.initTriggerSelection();
            } else if (newValue && !newValue.dest_application && newValue.src_application) {
                newValue.dest_application = _.find(self.project.applications, { "name": newValue.src_application.name });
                self.onSelectDestApplication();

            }
        }, true);

        this.initTriggerSelection = function () {
            // Update dest_application data
            self.trigger.dest_application = _.find(self.project.applications, { "name": self.trigger.dest_application.name });

            // Update pipeline List
            if (self.trigger.dest_application) {
                self.pipelineList = self.trigger.dest_application.pipelines.map(function (appPip) {
                    return appPip.pipeline;
                });
            }

            // Update pipeline + param + prerequisites
            var currentPipeline = _.find(self.pipelineList, { "name": self.trigger.dest_pipeline.name });
            if (currentPipeline)  {
                self.trigger.dest_pipeline.parameters = currentPipeline.parameters;
                self.trigger.parameters = Application.mergeParams(self.trigger.parameters, self.trigger.dest_pipeline.parameters);
                self.trigger.prerequisites.forEach(function (p, index) {
                    if (!_.find(self.trigger.parameters, { "name": p.parameter }) && p.parameter !== "git.branch") {
                        self.trigger.prerequisites.splice(index, 1);
                    }
                });

                self.loadSuggest();
            }

            if (!self.trigger.parameters) {
                self.trigger.parameters = [];
            }
            self.listPossiblePrerequisites = angular.copy(self.trigger.parameters);
            self.listPossiblePrerequisites.push({ name: "git.branch", type: "string", value: "" });
        };

        /**
         * @ngdoc function
         * @methodOf cdsApp.controller:TriggerAddCtrl
         * @name submit
         * @description Submit form
         */
        this.submit = function submit (form) {
            this.submitted = true;
            self.envError = false;
            if (self.trigger.src_project && self.trigger.dest_project && self.trigger.dest_application && self.trigger.src_application && self.trigger.src_project.name === self.trigger.dest_project.name && self.trigger.dest_application.name === self.trigger.src_application.name) {
                if (self.trigger.dest_pipeline && self.trigger.src_pipeline && self.trigger.dest_pipeline.name === self.trigger.src_pipeline.name) {
                    if (self.trigger.src_environment && self.trigger.dest_environment && self.trigger.src_environment.id === self.trigger.dest_environment.id) {
                        self.envError = true;
                    }
                    if (!self.trigger.src_environment && !self.trigger.dest_environment) {
                        self.envError = true;
                    }
                    if (self.trigger.dest_pipeline.type === self.trigger.src_pipeline.type && self.trigger.src_pipeline.type === "build") {
                        self.envError = true;
                    }
                }
            }

            if (form.$valid && !self.envError) {
                self.trigger.parameters = ParameterService.format(self.trigger.parameters);

                self.trigger.src_pipeline = {
                    id: self.trigger.src_pipeline.id,
                    name: self.trigger.src_pipeline.name
                };
                self.trigger.src_application = {
                    id: self.trigger.src_application.id,
                    name: self.trigger.src_application.name
                };
                if (self.trigger.src_environment) {
                    self.trigger.src_environment = {
                        id: self.trigger.src_environment.id,
                        name: self.trigger.src_environment.name
                    };
                }

                self.trigger.dest_pipeline = {
                    id: self.trigger.dest_pipeline.id,
                    name: self.trigger.dest_pipeline.name
                };
                self.trigger.dest_application = {
                    id: self.trigger.dest_application.id,
                    name: self.trigger.dest_application.name
                };
                if (self.trigger.dest_environment) {
                    self.trigger.dest_environment = {
                        id: self.trigger.dest_environment.id,
                        name: self.trigger.dest_environment.name
                    };
                }

                return self.done();
            }
            return $q.reject("Wrong form");
        };

        /**
         * @ngdoc function
         * @methodOf cdsApp.controller:TriggerAddCtrl
         * @name onSelectDestApplication
         * @description Reset pipeline information when selecting a new application
         */
        this.onSelectDestApplication = function () {
            delete self.trigger.dest_pipeline;
            delete self.trigger.parameters;
            delete self.trigger.prerequisites;
            self.pipelineList = self.trigger.dest_application.pipelines.map(function (appPip) {
                return appPip.pipeline;
            });
        };

        /**
         * @ngdoc function
         * @methodOf cdsApp.controller:TriggerAddCtrl
         * @name onSelectDestPipeline
         * @description Set application pipeline parameters
         */
        this.onSelectDestPipeline = function () {
            var applicationPipeline = _.find(self.trigger.dest_application.pipelines, { "pipeline" : { "name" : self.trigger.dest_pipeline.name } });
            self.trigger.parameters = Application.mergeParams(applicationPipeline.parameters, self.trigger.dest_pipeline.parameters);
            self.trigger.prerequisites = [];

            self.listPossiblePrerequisites = angular.copy(self.trigger.parameters);
            self.listPossiblePrerequisites.push({ name: "git.branch", type: "string", value: "" });

            self.loadSuggest();
        };

        this.loadSuggest = function () {
            CDSSuggestVariableRsc.query({ "key" : self.trigger.dest_project.key, "appName" : self.trigger.dest_application.name }, function (data) {
                self.suggest = data;
            });
        };

        /**
         * @ngdoc function
         * @methodOf cdsApp.controller:TriggerAddCtrl
         * @name addPrerequisite
         * @description Add a prerequisite on the trigger
         */
        this.addPrerequisite = function () {
            self.trigger.prerequisites.push({
                parameter: self.listPossiblePrerequisites[0].name,
                value : ""
            });
        };

        /**
         * @ngdoc function
         * @methodOf cdsApp.controller:TriggerAddCtrl
         * @name removePrerequisite
         * @description Remove the given prerequisite
         */
        this.removePrerequisite = function (index) {
            self.trigger.prerequisites.splice(index, 1);
        };

        this.onSelectDestEnv = function () {
            if (self.trigger.dest_environment.name.length >= 4 && self.trigger.dest_environment.name.toLowerCase().substr(0, 4) === "prod") {
                self.trigger.manual = true;
            }
        };
    },
    templateUrl: "components/trigger-management/trigger.html"
});
