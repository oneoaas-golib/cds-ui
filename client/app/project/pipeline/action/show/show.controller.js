"use strict";

/**
 * @ngdoc controller
 * @name cdsApp.controller:PipelineActionShowCtrl
 * @requires $state, $translate, Messaging, CDSSuggestVariableRsc, Pipeline, Permission, Project
 *
 * @description Manage show pipeline action view
 *
 */
angular.module("cdsApp").controller("PipelineActionShowCtrl", function PipelineActionShowCtrl ($q, $scope, $state, $translate, Messaging, CDSPipelineJoinedActionRsc, CDSSuggestVariableRsc, CDSPipelineRsc, Permission, Project, Warning, ParameterService, Pipeline) {

    var self = this;

    this.canEditAction = false;
    this.action = {};
    this.pipelineName = $state.params.pipName;
    this.pipeline = {};
    this.project = {};
    this.suggest = [];
    this.key = $state.params.key;

    this.updateUrl = function (tab) {
        $state.go("app.pipeline-action-show", { key: $state.params.key, pipName: $state.params.pipName, stageId: $state.params.stageId, actionId: $state.params.actionId, tab: tab },
            { notify: false, reload: false });
    };

    /**
     * @ngdoc function
     * @methodOf cdsApp.controller:PipelineActionShowCtrl
     * @name canWrite
     * @description Test if the current user can write
     */
    this.canWrite = function () {
        self.canEditAction = Permission.canWrite(self.pipeline.permission);
        $scope.$broadcast("hideEditMode", !self.canEditAction);
    };

    /**
     * @ngdoc function
     * @methodOf cdsApp.controller:PipelineActionShowCtrl
     * @name savePipelineAction
     * @description Call API to save the action
     */
    this.savePipelineAction = function (a) {
        // Cast action parameters in String
        if (a.parameters) {
            a.parameters = ParameterService.format(a.parameters);
        }

        // Cast sub action parameters in String
        if (a.actions) {
            a.actions.forEach(function (item, index) {
                if (item.parameters) {
                    a.actions[index].parameters = ParameterService.format(item.parameters);
                }
            });
        }
        return Pipeline.updatePipelineAction($state.params.key, $state.params.pipName, $state.params.stageId, $state.params.actionId, a).then(function (data) {
            self.action = data;
            self.loadAudit();
        }).$promise;
    };

    /**
     * @ngdoc function
     * @methodOf cdsApp.controller:ApplicationShowCtrl
     * @name loadParamSuggest
     * @description Load parameters suggestion
     */
    this.loadParamSuggest = function () {
        CDSSuggestVariableRsc.query({ "key" : $state.params.key }, function (data) {
            self.suggest = data;
        });
    };

    /**
     * @ngdoc function
     * @methodOf cdsApp.controller:PipelineActionShowCtrl
     * @name loadPipelineAction
     * @description Load the given pipeline action
     */
    this.loadPipelineAction = function () {
        Pipeline.getJoinedAction($state.params.key, $state.params.pipName, $state.params.stageId, $state.params.actionId).then(function (data) {
            self.action = data;
            self.loadAudit();
        });
    };

    this.loadAudit = function () {
        self.action.parameters = ParameterService.unformat(self.action.parameters);
        if (self.action.actions) {
            self.action.actions.forEach(function (sub) {
                sub.parameters =   ParameterService.unformat(sub.parameters);
            });
        }

        CDSPipelineJoinedActionRsc.audit({ key: $state.params.key, pipName: $state.params.pipName, stageId: $state.params.stageId, actionId: self.action.id }, function (data) {
            self.audit = data;
            if (self.audit && self.audit.length > 0) {
                self.audit.forEach(function (a) {
                    if (!self.action.requirements) {
                        self.action.requirements = [];
                    }
                    if (!self.action.parameters) {
                        self.action.parameters = [];
                    }

                    if (!a.action.requirements) {
                        a.action.requirements = [];
                    }
                    if (!a.action.parameters) {
                        a.action.parameters = [];
                    }
                    a.action.parameters = ParameterService.unformat(a.action.parameters);
                });
            }
        }, function (err) {
            Messaging.error(err);
        });
    };

    /**
     * @ngdoc function
     * @methodOf cdsApp.controller:PipelineActionShowCtrl
     * @name loadProject
     * @description Load the given project
     */
    this.loadProject = function () {
        Project.getProject($state.params.key).then(function (data) {
            self.project = data;
        });
    };

    /**
     * @ngdoc function
     * @methodOf cdsApp.controller:PipelineShowCtrl
     * @name loadPipeline
     * @description Load the given pipeline
     */
    this.loadPipeline = function () {
        Pipeline.getPipeline($state.params.key, $state.params.pipName).then(function (data) {
            self.pipeline = data;
            self.canWrite();
        });
    };

    this.init = function () {
        self.tab = $state.params.tab;
        self.loadPipelineAction();
        self.loadProject();
        self.loadParamSuggest();
        self.loadPipeline();
        self.pipelineWarning = Warning.getPipelineInProjectWarning(self.key, $state.params.pipName);

    };

    $scope.$on("refresh-warning-data", function () {
        self.pipelineWarning = Warning.getPipelineInProjectWarning(self.key, $state.params.pipName);
    });

    this.init();

});
