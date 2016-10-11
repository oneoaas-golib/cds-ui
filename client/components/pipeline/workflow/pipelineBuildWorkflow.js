"use strict";

angular.module("cdsApp").component("pipelineBuildWorkflow", {
    bindings: {
        pipeline: "=",
        project: "=",
        prerequisites: "="
    },
    controllerAs: "ctrl",
    controller: function ($q, $scope, $state, $translate, CDSStageRsc, CDSPipelineActionRsc, Messaging, EditMode, Warning, Pipeline, Modal) {
        var self = this;
        this.key = $state.params.key;
        this.edit = EditMode.get();

        this.stagePopover = {
            isOpen: false,
            templateUrl: "components/pipeline/workflow/template/stagePopoverTemplate.html",
            open: function open (stage) {
                stage.popover = true;
            },
            close: function close (stage) {
                stage.popover = false;
            }
        };

        this.addEmptyAction = function (stage) {
            if (!Pipeline.existInCache(self.key, $state.params.pipName)) {
                var modal = Modal.confirm.forceUpdate($translate.instant("common_pipeline"));
                return modal.then(function () {
                    return self.addNewJobOnStage(stage);
                }, function () {
                    return $q.reject("Cancel");
                });
            } else {
                return self.addNewJobOnStage(stage);
            }
        };

        this.addNewJobOnStage = function (stage) {
            var action = {
                name: "MyNewJob",
                type: "Joined"
            };
            return self.addNewJoinedAction(action, stage);
        };

        this.deletePrerequisite = function (stage, index) {
            stage.prerequisites.splice(index, 1);
        };

        this.addPrerequisite = function (stage) {
            if (!stage.prerequisites) {
                stage.prerequisites = [];
            }
            stage.prerequisites.push({
                parameter: self.prerequisites[0].name,
                expected_value: ""
            });
        };

        this.updatePipelineAction = function (stage, action, newValue) {
            action.enabled = newValue;
            if (!Pipeline.existInCache(self.key, $state.params.pipName)) {
                var modal = Modal.confirm.forceUpdate($translate.instant("common_pipeline"));
                return modal.then(function () {
                    return self.savePipelineAction(action);
                }, function () {
                    return $q.reject("Cancel");
                });
            } else {
                return self.savePipelineAction(action);
            }
        };

        this.savePipelineAction = function (action) {
            CDSPipelineActionRsc.update({ "key": $state.params.key, "pipName": $state.params.pipName, "pipelineActionId": action.pipeline_action_id }, action, function () {
                Pipeline.invalidPipeline($state.params.key, $state.params.pipName);
                Pipeline.getPipeline($state.params.key, $state.params.pipName).then(function (pip) {
                    self.pipeline = pip;
                });
                Messaging.success($translate.instant("pipeline_build_workflow_msg_action_updated"));
            }, function (err) {
                Messaging.error(err);
            });
        };

        this.updateStage = function (stage) {
            if (!Pipeline.existInCache(self.key, $state.params.pipName)) {
                var modal = Modal.confirm.forceUpdate($translate.instant("common_pipeline"));
                return modal.then(function () {
                    return self.updateStageInPipeline(stage);
                }, function () {
                    return $q.reject("Cancel");
                });
            } else {
                return self.updateStageInPipeline(stage);
            }
        };

        this.updateStageInPipeline = function (stage) {
            return CDSStageRsc.update({ "key": $state.params.key, "pipName": $state.params.pipName, "stageId": stage.id }, stage, function () {
                Messaging.success($translate.instant("pipeline_build_workflow_pipeline_updated"));
                stage.popover = false;
                Pipeline.invalidPipeline($state.params.key, $state.params.pipName);
                return Pipeline.getPipeline($state.params.key, $state.params.pipName).then(function (pip) {
                    self.pipeline = pip;
                });
            }, function (err) {
                Messaging.error(err);
                return $q.reject(err);
            }).$promise;
        };

        this.addNewJoinedAction = function (action, stage) {
            return Pipeline.addJoinedAction($state.params.key, $state.params.pipName, stage.id, action).then(function (action) {
                action.pipeline_stage_id = stage.id;
                if (!stage.actions) {
                    stage.actions = [];
                }
                stage.actions.push(action);
                Pipeline.invalidPipeline($state.params.key, $state.params.pipName);
                return Pipeline.getPipeline($state.params.key, $state.params.pipName).then(function (pip) {
                    self.pipeline = pip;
                });
            }).$promise;
        };

        this.deleteAction = function (stage, action, index) {
            if (!Pipeline.existInCache(self.key, $state.params.pipName)) {
                var modal = Modal.confirm.forceUpdate($translate.instant("common_pipeline"));
                return modal.then(function () {
                    return self.removePipelineAction(stage, action, index);
                }, function () {
                    return $q.reject("Cancel");
                });
            } else {
                return self.removePipelineAction(stage, action, index);
            }
        };

        this.removePipelineAction = function (stage, action, index) {
            return Pipeline.deletePipelineAction($state.params.key, $state.params.pipName, stage.id, action.id).then(function () {
                Messaging.success($translate.instant("pipeline_build_workflow_msg_action_deleted"));
                stage.actions.splice(index, 1);
                Pipeline.invalidPipeline($state.params.key, $state.params.pipName);
                return Pipeline.getPipeline($state.params.key, $state.params.pipName).then(function (pip) {
                    self.pipeline = pip;
                });
            }).$promise;
        };

        this.deleteStage = function (stage, index) {
            if (!Pipeline.existInCache(self.key, $state.params.pipName)) {
                var modal = Modal.confirm.forceUpdate($translate.instant("common_pipeline"));
                return modal.then(function () {
                    return self.removeStageFromPipeline(stage, index);
                }, function () {
                    return $q.reject("Cancel");
                });
            } else {
                return self.removeStageFromPipeline(stage, index);
            }
        };

        this.removeStageFromPipeline = function (stage, index) {
            return CDSStageRsc.delete({
                "key": $state.params.key,
                "pipName": $state.params.pipName,
                "stageId": stage.id
            }, function () {
                self.pipeline.stages.splice(index, 1);
                Messaging.success($translate.instant("pipeline_build_workflow_msg_stage_deleted"));
                Pipeline.invalidPipeline($state.params.key, $state.params.pipName);
                return Pipeline.getPipeline($state.params.key, $state.params.pipName).then(function (pip) {
                    self.pipeline = pip;
                });
            }, function (err) {
                Messaging.error(err);
                return $q.reject(err);
            }).$promise;
        };

        this.addStage = function () {
            if (!Pipeline.existInCache(self.key, $state.params.pipName)) {
                var modal = Modal.confirm.forceUpdate($translate.instant("common_pipeline"));
                return modal.then(function () {
                    return self.addStageInPipeline();
                }, function () {
                    return $q.reject("Cancel");
                });
            } else {
                return self.addStageInPipeline();
            }
        };

        this.addStageInPipeline = function () {
            if (!self.pipeline.stages) {
                self.pipeline.stages = [];
            }
            var stage = { "name": "stage_" + self.pipeline.stages.length, "actions": [] };
            return CDSStageRsc.save({ "key": $state.params.key, "pipName": $state.params.pipName }, stage, function (data) {
                Pipeline.invalidPipeline($state.params.key, $state.params.pipName);
                stage = data;
                self.pipeline.stages.push(stage);
                Pipeline.getPipeline($state.params.key, $state.params.pipName).then(function (pip) {
                    self.pipeline = pip;
                });
            }, function (err) {
                Messaging.error(err);
                return $q.reject(err);
            }).$promise;
        };

        this.hasWarning = function (a) {
            if (self.pipelineWarning && self.pipelineWarning.jobs) {
                var action = _.find(self.pipelineWarning.jobs, { action: { id: a.id } });
                if (action) {
                    return true;
                }
            }
            return false;
        };

        this.init = function () {
            self.pipelineWarning = Warning.getPipelineInProjectWarning(self.key, $state.params.pipName);
        };
        this.init();

        $scope.$on("refresh-warning-data", function () {
            self.pipelineWarning = Warning.getPipelineInProjectWarning(self.key, $state.params.pipName);
        });

        $scope.$on("editModeStateEvent", function (event, args) {
            self.edit = args;
        });
    },
    templateUrl: "components/pipeline/workflow/pipelineBuildWorkflow.html"
});
