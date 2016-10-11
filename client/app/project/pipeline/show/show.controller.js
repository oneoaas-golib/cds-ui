"use strict";

/**
 * @ngdoc controller
 * @name cdsApp.controller:PipelineShowCtrl
 * @requires $scope, $rootScope, $state, $translate, Project, CDSPipelineTypeRsc, Pipeline, CDSPipelineParametersRsc, CDSPipelineGroupsRsc, Messaging, Permission, EditMode
 *
 * @description Manage show pipeline view
 *
 */
angular.module("cdsApp").controller("PipelineShowCtrl", function PipelineShowCtrl ($q, $scope, $rootScope, $state, $translate, Project, CDSPipelineTypeRsc, Pipeline, CDSPipelineParametersRsc, CDSPipelineGroupsRsc, Messaging, Permission, EditMode, Warning, Modal) {

    var self = this;

    this.canEditPipeline = false;
    this.edit = EditMode.get();
    this.project = {};
    this.key = $state.params.key;
    this.pipName = $state.params.pipName;
    this.pipeline = {};
    this.groups = [];
    this.tab = {};
    this.pipelineTypes = [];
    this.prerequisites = [];
    this.pipelineWarning = {};

    /**
     * @ngdoc function
     * @methodOf cdsApp.controller:ProjectShowCtrl
     * @name updatePipeline
     * @description Update pipeline
     */
    this.updatePipeline = function () {
        if (!Pipeline.existInCache(self.key, $state.params.pipName)) {
            var modal = Modal.confirm.forceUpdate($translate.instant("common_pipeline"));
            return modal.then(function () {
                return self.savePipeline();
            }, function () {
                return $q.reject("Cancel");
            });
        } else {
            return self.savePipeline();
        }
    };

    this.savePipeline = function () {
        return Pipeline.update($state.params.key, $state.params.pipName, self.pipeline).then(function () {
            Pipeline.invalidPipeline($state.params.key, $state.params.pipName);
            $state.go("app.pipeline-show", { "key": self.key, "pipName": self.pipeline.name, "tab": "advanced" },  { reload: true });
        }, function (err) {
            Messaging.error(err);
        }).$promise;
    };

    /**
     * @ngdoc function
     * @methodOf cdsApp.controller:ProjectShowCtrl
     * @name loadPipelineType
     * @description Load all type of pipeline
     */
    this.loadPipelineType = function () {
        CDSPipelineTypeRsc.query(function (data) {
            self.pipelineTypes = data;
        }, function (err) {
            Messaging.error(err);
        });
    };

    /**
     * @ngdoc function
     * @methodOf cdsApp.controller:ProjectShowCtrl
     * @name canWrite
     * @description Test if the current user can write
     */
    this.canWrite = function () {
        self.canEditPipeline = Permission.canWrite(self.pipeline.permission);
        $rootScope.$broadcast("hideEditMode", !self.canEditPipeline);
    };

    /**
     * @ngdoc function
     * @methodOf cdsApp.controller:PipelineShowCtrl
     * @name saveParameters
     * @description Call api to update pipeline_parameters
     */
    this.saveParameters = function () {
        if (!Pipeline.existInCache(self.key, $state.params.pipName)) {
            var modal = Modal.confirm.forceUpdate($translate.instant("common_pipeline"));
            return modal.then(function () {
                return self.updatePipelineParameters();
            }, function () {
                return $q.reject("Cancel");
            });
        } else {
            return self.updatePipelineParameters();
        }
    };

    this.updatePipelineParameters = function () {
        return CDSPipelineParametersRsc.update({ "key": $state.params.key, "pipName": $state.params.pipName }, self.pipeline.parameters, function (data) {
            self.initPrerequisites();
            Pipeline.invalidPipeline($state.params.key, $state.params.pipName);
            self.pipeline.parameters = data;
            return Pipeline.getPipeline($state.params.key, $state.params.pipName).then(function (pip) {
                self.pipeline = pip;
            });
        }, function (err) {
            Messaging.error(err);
            return $q.reject(err);
        }).$promise;
    };

    /**
     * @ngdoc function
     * @methodOf cdsApp.controller:PipelineShowCtrl
     * @name saveGroups
     * @description Call api to update pipeline_groups
     */
    this.saveGroups = function () {
        if (!Pipeline.existInCache(self.key, $state.params.pipName)) {
            var modal = Modal.confirm.forceUpdate($translate.instant("common_pipeline"));
            return modal.then(function () {
                return self.savePipelinePermission();
            }, function () {
                return $q.reject("Cancel");
            });
        } else {
            return self.savePipelinePermission();
        }
    };

    this.savePipelinePermission = function () {
        return CDSPipelineGroupsRsc.update({ "key" : $state.params.key, "pipName": $state.params.pipName }, self.groups, function () {
            self.pipeline.groups = angular.copy(self.groups);
            Pipeline.invalidPipeline($state.params.key, $state.params.pipName);
            return Pipeline.getPipeline($state.params.key, $state.params.pipName).then(function (pip) {
                self.pipeline = pip;
                self.groups = angular.copy(self.pipeline.groups);
            });
        }, function (err) {
            Messaging.error(err);
            self.groups = angular.copy(self.pipeline.groups);
            return $q.reject(err);
        }).$promise;
    };

    this.initPrerequisites = function () {
        self.prerequisites = [];
        if (self.pipeline.parameters) {
            self.prerequisites = angular.copy(self.pipeline.parameters);
        }
        self.prerequisites.push({
            name: "git.branch",
            value: "master"
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
            self.groups = angular.copy(self.pipeline.groups);
            self.initPrerequisites();
            self.canWrite();
        });
    };

    /**
     * @ngdoc function
     * @methodOf cdsApp.controller:PipelineShowCtrl
     * @name deletePipeline
     * @description Call API to delete the current pipeline
     */
    this.deletePipeline = function () {
        return Pipeline.delete($state.params.key, $state.params.pipName).then(function () {
            Messaging.success($translate.instant("pipeline_show_msg_pipeline_deleted"));
            Pipeline.invalidPipeline($state.params.key, $state.params.pipName);
            $state.go("app.project-show", { "key": $state.params.key });
        }).$promise;
    };

    /**
     * @ngdoc function
     * @methodOf cdsApp.controller:PipelineShowCtrl
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
     * @name selectTab
     * @description Select tab
     */
    this.selectTab = function (tab) {
        switch (tab) {
            case "workflow":
                self.tab.active = 0;
                break;
            case "parameter":
                self.tab.active = 1;
                break;
            case "group":
                self.tab.active = 2;
                break;
            case "advanced":
                self.tab.active = 3;
                break;
        }
        $state.go("app.pipeline-show", { "key": $state.params.key, "pipName": $state.params.pipName, "tab": tab },  { notify: false, reload: false });
    };

    this.init = function () {
        self.loadPipeline();
        self.loadProject();
        self.loadPipelineType();
        self.selectTab($state.params.tab);
        self.pipelineWarning = Warning.getPipelineInProjectWarning(self.key, $state.params.pipName);
    };

    $scope.$on("refresh-warning-data", function () {
        self.pipelineWarning = Warning.getPipelineInProjectWarning(self.key, $state.params.pipName);
    });

    this.init();

    $scope.$on("editModeStateEvent", function (event, args) {
        self.edit = args;
    });

});
