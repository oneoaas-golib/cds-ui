"use strict";

angular.module("cdsApp").component("pipelineList", {
    bindings: {
        project: "="
    },
    controllerAs: "ctrl",
    controller: function ($q, $state, $translate, Pipeline, Messaging, Permission, CDSPipelineTypeRsc, Modal, Project) {
        var self = this;

        this.selected = {
            pipeline: {}
        };
        this.pipelineNamePattern = new RegExp("^[a-zA-Z0-9.-_-]{1,}$");

        // new pipeline name
        this.key = $state.params.key;
        this.newPipeline = "";

        this.submit = function (form) {
            self.submitted = true;
            if (form.$valid) {
                return self.add();
            }
            return $q.reject("Wrong form");
        };

        this.canWrite = function () {
            return Permission.canWrite(self.project.permission);
        };

        this.loadPipelineType = function () {
            CDSPipelineTypeRsc.query(function (data) {
                self.pipelineTypes = data;
                self.selected.pipeline.type = data[0];
            }, function (err) {
                Messaging.error(err);
            });
        };

        /**
         * @ngdoc function
         * @name add
         * @description Create a new pipeline
         */
        this.add = function () {
            if (!Project.existInCache(self.key)) {
                var modal = Modal.confirm.forceUpdate($translate.instant("common_project"));
                return modal.then(function () {
                    return self.addPipeline();
                }, function () {
                    return $q.reject("Cancel");
                });
            } else {
                return self.addPipeline();
            }

        };

        this.addPipeline = function () {
            return Pipeline.addPipeline($state.params.key, self.selected.pipeline).then(function () {
                if (!self.project.pipelines) {
                    self.project.pipelines = [];
                }
                self.submitted = false;
                self.project.pipelines.push(self.selected.pipeline);
                self.selected.pipeline = {
                    type: self.pipelineTypes[0]
                };
                Project.invalidProject($state.params.key);
                return Project.getProject($state.params.key).then(function (project) {
                    self.project = project;
                });
            }).$promise;
        };

        this.init = function () {
            this.loadPipelineType();
        };
        this.init();
    },
    templateUrl: "components/pipeline-list/pipelineList.html"
});
