"use strict";

angular.module("cdsApp").component("pipelineDiagramItem", {
    bindings: {
        item: "=",
        orientation: "@",
        branch: "@"
    },
    controllerAs: "PipelineDiagramItemCtrl",
    controller: function ($uibModal, $scope, $state, $translate, CDSApplicationPipelineRunRsc, CDSApplicationPipelinesRsc, CDSPipelineBuildRsc, Messaging, PipelineBuild, BUILD_CONSTANTS, Application, Project, Permission) {
        var self = this;
        self.projectKey = $state.params.key;
        self.appName = $state.params.appName;
        self.showTooltip = false;

        $scope.$watch(function () {
            return self.item;
        }, function (newValue) {
            if (self.orientation && self.orientation === "vertical") {
                self.endpointOptionsAuto.top.target.anchor = "TopCenter";
                self.endpointOptionsAuto.bottom.source.anchor = "BottomCenter";
                self.endpointOptionsManual.top.target.anchor = "TopCenter";
                self.endpointOptionsManual.bottom.source.anchor = "BottomCenter";
            } else if (self.orientation && self.orientation === "horizontal") {
                self.endpointOptionsAuto.top.target.anchor = "Left";
                self.endpointOptionsAuto.bottom.source.anchor = "Right";
                self.endpointOptionsManual.top.target.anchor = "Left";
                self.endpointOptionsManual.bottom.source.anchor = "Right";
            }
            if (newValue && !self.item.options) {
                if (self.item.trigger.manual) {
                    self.item.options = self.endpointOptionsManual;

                } else {
                    self.item.options = self.endpointOptionsAuto;
                }
            }
        });

        this.canEditPipeline = function () {
            if (self.item) {
                return Permission.canWrite(self.item.pipeline.permission);
            }
            return false;
        };

        this.canEditApplication = function () {
            if (self.item) {
                return Permission.canWrite(self.item.application.permission);
            }
            return false;
        };

        this.canRun = function () {
            if (self.item) {
                if (Permission.canExecute(self.item.application.permission) && Permission.canExecute(self.item.pipeline.permission)) {
                    if (self.item.environment.id > 1) {
                        if (Permission.canExecute(self.item.environment.permission)) {
                            return true;
                        }
                    } else {
                        return true;
                    }
                }
            }
            return false;
        };

        this.seeDetail = function () {
            $state.go("app.application-pipeline-build", {
                "key": self.projectKey,
                "appName": self.item.application.name,
                "pipName": self.item.pipeline.name,
                "buildId": self.item.pipeline.last_pipeline_build.build_number,
                "env": self.item.environment.name
            });
        };

        /**
         * @ngdoc function
         * @name detachPipeline
         * @description Detach pipeline to application
         */
        this.detachPipeline = function () {
            var modal = $uibModal.open({
                animation: true,
                size: "lg",
                templateUrl: "components/pipeline-diagram/item/modal/detach/detach.html",
                controller: "DetachModalCtrl",
                controllerAs : "ctrl",
                resolve: {
                    applicationID: function () {
                        return self.item.application.id;
                    },
                    pipeline: function () {
                        return self.item.pipeline;
                    }
                }
            });

            modal.result.then(function () {
                CDSApplicationPipelinesRsc.delete({
                    "key": $state.params.key,
                    "appName": $state.params.appName,
                    "pipName": self.item.pipeline.name
                }, {}, function () {
                    Messaging.success($translate.instant("pipeline_diagram_item_msg_pipeline_detached"));
                    Application.invalidApplication($state.params.key, $state.params.appName);
                    Project.invalidProject($state.params.key);
                    $state.go("app.application-show", {
                        "key": $state.params.key,
                        "appName": $state.params.appName
                    }, { "reload": true });
                }, function (err) {
                    if (err) {
                        Messaging.error(err);
                    }
                });
            });
        };

        this.getBy = function () {
            if (self.item && self.item.pipeline && self.item.pipeline.last_pipeline_build) {
                var by = PipelineBuild.getTriggeredBy(self.item.pipeline.last_pipeline_build);
                switch (by) {
                    case BUILD_CONSTANTS.TRIGGER_MANUAL_HUMAN:
                        if (self.item.pipeline.last_pipeline_build.trigger && self.item.pipeline.last_pipeline_build.trigger.triggered_by) {
                            return self.item.pipeline.last_pipeline_build.trigger.triggered_by.username;
                        }
                        return "";
                    case BUILD_CONSTANTS.TRIGGER_AUTO_HUMAN:
                        if (self.item.pipeline.last_pipeline_build.trigger && self.item.pipeline.last_pipeline_build.trigger.triggered_by) {
                            return self.item.pipeline.last_pipeline_build.trigger.triggered_by.username;
                        }
                        return "";
                    case BUILD_CONSTANTS.TRIGGER_AUTO_PIPELINE:
                        if (self.item.pipeline.last_pipeline_build.trigger) {
                            return self.item.pipeline.last_pipeline_build.trigger.vcs_author;
                        }
                        return "";
                    default:
                        if (self.item.pipeline.last_pipeline_build.trigger) {
                            return self.item.pipeline.last_pipeline_build.trigger.vcs_author;
                        }
                        return "";
                }
            }
        };

        this.rollback = function () {
            CDSPipelineBuildRsc.rollback({
                "key": $state.params.key,
                "appName": self.item.application.name,
                "pipName": self.item.pipeline.name,
            }, { "env" : { "name": self.item.environment.name } }, function (data) {
                $state.go("app.application-pipeline-build", {
                    "key": $state.params.key,
                    "appName": self.item.application.name,
                    "pipName": self.item.pipeline.name,
                    "buildId": data.build_number,
                    "env" : self.item.environment.name
                });
            }, function (err) {
                Messaging.error(err);
            });
        };

        this.runAgain = function () {
            CDSPipelineBuildRsc.runAgain({
                "key": $state.params.key,
                "appName": self.item.application.name,
                "pipName": self.item.pipeline.name,
                "buildId": self.item.pipeline.last_pipeline_build.build_number,
                "envName": self.item.environment.name
            }, function (data) {
                $state.go("app.application-pipeline-build", {
                    "key": $state.params.key,
                    "appName": self.item.application.name,
                    "pipName": self.item.pipeline.name,
                    "buildId": data.build_number,
                    "env" : self.item.environment.name
                });
            }, function (err) {
                Messaging.error(err);
            });
        };

        this.stopPipeline = function () {
            CDSPipelineBuildRsc.stop({ "key": $state.params.key, "appName": self.item.application.name, "pipName": self.item.pipeline.name, "buildId": self.item.pipeline.last_pipeline_build.build_number }, { "envName": self.item.environment.name }, function () {
                Messaging.success($translate.instant("pipeline_diagram_item_msg_stop"));
            }, function (err) {
                Messaging.error(err);
            });
        };

        this.runPipeline = function () {
            var hasEmptyParams = false;
            if (self.item.pipeline.parameters) {
                self.item.pipeline.parameters.forEach(function (p) {
                    if (!p.value || p.value === "") {
                        hasEmptyParams = true;
                    }
                });
            }

            var parentBranch = "";
            var currentBranch = "";

            if (self.item.parent) {
                parentBranch = self.item.parent.branch;
            }
            if (self.item.pipeline.last_pipeline_build && self.item.pipeline.last_pipeline_build.trigger) {
                currentBranch = self.item.pipeline.last_pipeline_build.trigger.vcs_branch;
            }

            if (self.branch && self.branch !== "") {
                currentBranch = self.branch;
            }

            if ((!self.item.parent && !hasEmptyParams)  || (self.item.parent && !self.item.trigger.manual && currentBranch === parentBranch)) {
                var request =  { parameters: [] };
                if (self.item.environment.id > 1) {
                    request.env = self.item.environment;
                }
                if (self.item.parent !== undefined && self.item.parent !== {}) {
                    request.parent_build_number = self.item.parent.buildNumber;
                    request.parent_pipeline_id = self.item.parent.pipelineID;
                    request.parent_environment_id = self.item.trigger.src_environment.id;
                    request.parent_application_id = self.item.parent.applicationID;
                    request.parameters = self.item.trigger.parameters;
                } else {
                    request.parameters.push({ name: "git.branch", value: currentBranch });
                }

                CDSApplicationPipelineRunRsc.save({ "key": $state.params.key, "appName": self.item.application.name, "pipName": self.item.pipeline.name }, request, function (data) {
                    $state.go("app.application-pipeline-build", {
                        "key": $state.params.key,
                        "appName": self.item.application.name,
                        "pipName": self.item.pipeline.name,
                        "buildId": data.build_number,
                        "env" : self.item.environment.name
                    });
                }, function (err) {
                    Messaging.error(err);
                });
            } else {
                $state.go("app.application-pipeline-launch", {
                    "key": $state.params.key,
                    "appName": self.item.application.name,
                    "pipName": self.item.pipeline.name,
                    "env": self.item.environment.id,
                    "trigger": self.item.trigger.id,
                    "branch": self.branch
                });
            }
        };

        this.getStatusClass = function () {
            if (self.item.pipeline.last_pipeline_build) {
                switch (self.item.pipeline.last_pipeline_build.status) {
                    case "Success":
                        return "panel-success";
                    case "Fail" :
                        return "panel-danger";
                    case "Building" :
                        return "panel-info";
                    case "Warning" :
                        return "panel-warning";
                    default:
                        return "panel-default";
                }
            }
            return "panel-default";
        };

        // Style of jsplumb connector
        var connectorPaintStyleAuto = {
                lineWidth: 6,
                strokeStyle: "#4a6785",
                joinstyle: "round",
                outlineColor: "white",
                outlineWidth: 0
            },
            connectorHoverStyleAuto = {
                lineWidth: 6,
                strokeStyle: "#216477",
                outlineWidth: 0,
                outlineColor: "white"
            };
        var connectorPaintStyleManual = {
                lineWidth: 6,
                strokeStyle: "#fb5043",
                joinstyle: "round",
                outlineColor: "white",
                outlineWidth: 0
            },
            connectorHoverStyleManual = {
                lineWidth: 6,
                strokeStyle: "#ca4f14",
                outlineWidth: 0,
                outlineColor: "white"
            };

        this.endpointOptionsAuto = {
            top: {
                target: {
                    endpoint: ["Blank", {}],
                    anchor: "TopCenter",
                    maxConnections: -1,
                    isTarget: true,
                    connector: ["Flowchart", { stub: [40, 60], gap: 10, cornerRadius: 5, alwaysRespectStubs: false }],
                    connectorStyle: connectorPaintStyleAuto,
                    connectorHoverStyle: connectorHoverStyleAuto
                }
            },
            bottom: {
                source: {
                    endpoint: ["Blank", {}],
                    anchor: "BottomCenter",
                    isSource: true
                }
            }
        };

        this.endpointOptionsManual = {
            top: {
                target: {
                    endpoint: ["Blank", {}],
                    anchor: "TopCenter",
                    maxConnections: -1,
                    isTarget: true,
                    connector: ["Flowchart", { stub: [40, 60], gap: 10, cornerRadius: 5, alwaysRespectStubs: false }],
                    connectorStyle: connectorPaintStyleManual,
                    connectorHoverStyle: connectorHoverStyleManual
                }
            },
            bottom: {
                source: {
                    endpoint: ["Blank", {}],
                    anchor: "BottomCenter",
                    isSource: true
                }
            }
        };

        this.getLabelConnector = function () {
            if (self.item.trigger.manual) {
                return $translate.instant("pipeline_diagram_item_msg_trigger_manual");
            } else {
                return $translate.instant("pipeline_diagram_item_msg_trigger_auto");
            }
        };

        $scope.$on("jsplumb.instance.connection.mouseover", function (evt, info) {
            if (info.targetId === self.item.top.id) {
                self.showTooltip = true;
                $scope.$apply();
            }
        });

        $scope.$on("jsplumb.instance.connection.mouseout", function (evt, info) {
            if (info.targetId === self.item.top.id) {
                self.showTooltip = false;
                $scope.$apply();
            }
        });

        $scope.$on("jsplumb.instance.connection.click", function (evt, connection) {
            if (connection.targetId === self.item.top.id) {
                $state.go("app.application-trigger-edit", { "key": $state.params.key, "appName": self.item.parent.applicationName, "pipName": self.item.parent.pipelineName, "triggerId" : self.item.trigger.id });
            }
        });
    },
    templateUrl: "components/pipeline-diagram/item/item.html"
});
