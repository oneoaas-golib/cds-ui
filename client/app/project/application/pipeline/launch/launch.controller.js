"use strict";

/**
 * @ngdoc controller
 * @name cdsApp.controller:PipelineLaunchCtrl
 * @requires $state, Project, CDSTriggersRsc, CDSSuggestVariableRsc, CDSApplicationPipelineHistoryRsc, CDSEnvRsc, CDSApplicationPipelineRunRsc, Messaging, Application, PARAMETER
 *
 * @description Launch a pipeline with customized parameters
 *
 */
angular.module("cdsApp").controller("PipelineLaunchCtrl", function ApplicationShowCtrl ($q, $translate, $state, Project, Pipeline, CDSRepoManagerRsc, CDSTriggersRsc, CDSApplicationPipelinesRsc, CDSSuggestVariableRsc, CDSApplicationPipelineHistoryRsc, CDSApplicationPipelineRunRsc, Messaging, Application, PARAMETER, ParameterService) {

    var self = this;
    this.pipeline = {};
    this.trigger = {};
    this.project = {};
    this.oldBuilds = [];

    // Pipelines attached to the application
    this.pipelines = [];
    this.hasParent = true;

    this.appName = $state.params.appName;
    this.pipName = $state.params.pipName;
    this.key = $state.params.key;

    this.suggest = [];

    this.selected = {
        environment : {
            name : ""
        },
        parent: {},
        parameters: [],
        gitParameters: []
    };

    this.application = {};
    /**
     * @ngdoc function
     * @methodOf cdsApp.controller:ApplicationShowCtrl
     * @name loadParamSuggest
     * @description Load parameters suggestion
     */
    this.loadParamSuggest = function () {
        CDSSuggestVariableRsc.query({ "key" : $state.params.key, "appName" : $state.params.appName }, function (data) {
            self.suggest = data;
        });
    };

    /**
     * @ngdoc function
     * @name submit
     * @description Submit form
     */
    this.submit = function submit (form) {
        if (_.isArray(self.selected.parameters)) {
            for (var i = 0; i < self.selected.parameters.length; i++) {
                var param = self.selected.parameters[i];
                if (param.type === PARAMETER.TYPE_PIPELINE && (!param.value || param.value === "")) {
                    Messaging.error($translate.instant("application_pipeline_msg_err_param_pipeline"));
                    return;
                }
            }
        }

        this.submitted = true;

        if (form.$valid) {
            var request =  { parameters: angular.copy(self.selected.parameters) };
            if (self.selected.environment && self.selected.environment.id > 1) {
                request.env = self.selected.environment;
            }

            if (self.hasParent) {
                request.parent_build_number = self.selected.parent.build_number;
                request.parent_pipeline_id = self.trigger.src_pipeline.id;
                request.parent_environment_id = self.trigger.src_environment.id;
                request.parent_application_id = self.trigger.src_application.id;
            } else {
                if (!request.parameters) {
                    request.parameters = [];
                }
                request.parameters = request.parameters.concat(self.selected.gitParameters);
            }

            if (request.parameters) {
                request.parameters = ParameterService.format(request.parameters);
            }

            return CDSApplicationPipelineRunRsc.save({ "key": $state.params.key, "appName": $state.params.appName, "pipName": $state.params.pipName }, request, function (data) {
                $state.go("app.application-pipeline-build", {
                    "key": $state.params.key,
                    "appName": $state.params.appName,
                    "pipName": $state.params.pipName,
                    "buildId": data.build_number,
                    "env" : self.selected.environment.name
                });
            }, function (err) {
                Messaging.error(err);
                return $q.reject(err);
            }).$promise;
        } else {
            return $q.reject("Wrong form");
        }
    };

    this.refreshCommits = function () {
        if (self.selected.parent.trigger && self.selected.parent.trigger.vcs_hash) {
            CDSApplicationPipelinesRsc.commit({
                "key": $state.params.key,
                "appName": $state.params.appName,
                "pipName": $state.params.pipName,
                "envName": self.trigger.dest_environment.name,
                "hash": self.selected.parent.trigger.vcs_hash
            }, function (data) {
                self.commits = data;
            }, function (err) {
                Messaging.error(err);
            });
        }
    };

    /**
     * @ngdoc function
     * @methodOf cdsApp.controller:PipelineLaunchCtrl
     * @name loadPipeline
     * @description Load the pipeline to launch
     */
    this.loadPipeline = function () {
        Pipeline.getPipeline($state.params.key, $state.params.pipName).then(function (data) {
            self.pipeline = data;
            if (self.trigger.id) {
                self.mergeTriggerParameters();
            }
            if (!self.hasParent) {
                if (self.application.id) {
                    self.mergeApplicationPipelineParameters();
                }
            }
        });
    };

    this.mergeApplicationPipelineParameters = function () {
        var applicationPipeline = _.find(self.application.pipelines, { "pipeline" : { "name" : self.pipeline.name } });
        self.selected.parameters = Application.mergeParams(applicationPipeline.parameters, self.pipeline.parameters);

        var branchValue = "master";
        if ($state.params.branch && $state.params.branch !== "") {
            branchValue = $state.params.branch;
        }
        self.selected.gitParameters.push({ name: "git.branch", type: "string", value: branchValue });
    };

    /**
     * @ngdoc function
     * @methodOf cdsApp.controller:PipelineLaunchCtrl
     * @name loadTrigger
     * @description Load the trigger
     */
    this.loadTrigger = function () {
        CDSTriggersRsc.get({ "key": $state.params.key, "appName": $state.params.appName, "pipName": $state.params.pipName, "triggerId" : $state.params.trigger }, function (data) {
            self.trigger = data;

            var branchFilter = "";
            if (self.trigger.prerequisites) {
                self.trigger.prerequisites.forEach(function (p) {
                    if (p.parameter === "git.branch") {
                        if ($state.params.branch && $state.params.branch !== "") {
                            branchFilter = $state.params.branch;
                        } else {
                            branchFilter = p.expected_value;
                        }
                    }
                });
            }
            if (!self.trigger.parameters) {
                self.trigger.parameters = [];
            }
            if (self.pipeline.id) {
                self.mergeTriggerParameters();
            }
            self.loadBuildHistory(branchFilter);
        }, function (err) {
            Messaging.error(err);
        });
    };

    /**
     * @ngdoc function
     * @methodOf cdsApp.controller:PipelineLaunchCtrl
     * @name mergeTriggerParameters
     * @description merge trigger params in case of pipeline parameters update
     */
    this.mergeTriggerParameters = function () {
        self.selected.parameters = Application.mergeParams(self.trigger.parameters, self.pipeline.parameters);
    };

    /**
     * @ngdoc function
     * @methodOf cdsApp.controller:PipelineLaunchCtrl
     * @name loadEnvironments
     * @description Load project environments
     */
    this.loadEnvironments = function () {
        Project.getProject($state.params.key).then(function (project) {
            self.environments = project.environments;
            if (self.environments.length > 0) {
                self.environments.forEach(function (e) {
                    if (e.id.toString() === $state.params.env) {
                        self.selected.environment = e;
                    }
                });
            }
        });
    };

    /**
     * @ngdoc function
     * @methodOf cdsApp.controller:PipelineLaunchCtrl
     * @name loadBuildHistory
     * @description Load history
     */
    this.loadBuildHistory = function (branchName) {
        CDSApplicationPipelineHistoryRsc.query({
            "key": $state.params.key,
            "appName": self.trigger.src_application.name,
            "pipName": self.trigger.src_pipeline.name,
            "envName": self.trigger.src_environment.name,
            "limit": 20,
            "status": "Success",
            "branchName" : branchName
        }, function (data) {
            self.oldBuilds = data;
            for (var i = 0; i < data.length; i++) {
                if (data[i].status === "Success") {
                    if ($state.params.branch && $state.params.branch !== "") {
                        if (data[i].trigger.vcs_branch === $state.params.branch) {
                            self.selected.parent = data[i];
                            self.refreshCommits();
                            break;
                        }
                    } else {
                        self.selected.parent = data[i];
                        self.refreshCommits();
                        break;
                    }

                }
            }
        }, function (err) {
            Messaging.error(err);
        });
    };

    /**
     * @ngdoc function
     * @methodOf cdsApp.controller:PipelineLaunchCtrl
     * @name loadProject
     * @description Load project
     */
    this.loadProject = function () {
        Project.getProject($state.params.key).then(function (data) {
            self.project = data;
            var applicationPipelines = _.find(self.project.applications, { name: self.appName });
            if (applicationPipelines && _.isArray(applicationPipelines.pipelines)) {
                applicationPipelines.pipelines.forEach(function (appPip) {
                    self.pipelines.push(appPip.pipeline);
                });
            }
        });
    };

    this.loadApplication = function () {
        Application.getApplication(self.key, self.appName).then(function (data) {
            self.application = data;
            if (data.repositories_manager) {
                CDSRepoManagerRsc.repo({ "key": self.key, "repoManName": data.repositories_manager.name, "repo": data.repository_fullname }, function (result) {
                    self.urlRepo = result.url;
                }, function (err) {
                    Messaging.error(err);
                });
            }
            // If no trigger, merge param with pipeline params
            if (!self.hasParent && self.pipeline.id) {
                self.mergeApplicationPipelineParameters();
            }
        });
    };

    this.init = function () {
        if ($state.params.trigger !== "0") {
            self.loadTrigger();
            self.hasParent = true;
        } else {
            self.hasParent = false;
        }
        self.loadPipeline();
        self.loadEnvironments();
        self.loadParamSuggest();
        self.loadProject();
        self.loadApplication();
    };

    this.init();

});
