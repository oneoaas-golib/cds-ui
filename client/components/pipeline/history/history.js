"use strict";

angular.module("cdsApp").component("pipelineHistory", {
    bindings: {
        builds: "=",
        environment: "@",
        buildnumber: "@"
    },
    controllerAs: "ctrl",
    controller: function ($q, $translate, $state, durationFilter, PipelineBuild, BUILD_CONSTANTS, CDSPipelineBuildRsc, Messaging) {
        var self = this;
        this.key = $state.params.key;
        this.appName = $state.params.appName;

        this.goToPipelineBuild = function (b) {
            $state.go("app.application-pipeline-build", {
                "key": self.key,
                "appName": self.appName,
                "pipName": b.pipeline.name,
                "buildId": b.build_number,
                "env": b.environment.name
            });
        };

        this.getBuildLast = function (pb) {
            var format = "mm '" + $translate.instant("pipeline_diagram_item_time_minute") + "' ss '" + $translate.instant("pipeline_diagram_item_time_second") + "'";
            return durationFilter((new Date(pb.done)).getTime() - (new Date(pb.start)).getTime(), format);
        };

        this.getTriggeredBy = function (pb) {
            if (pb.trigger) {
                switch (PipelineBuild.getTriggeredBy(pb)) {
                    case BUILD_CONSTANTS.TRIGGER_AUTO_HUMAN:
                        return $translate.instant("pipeline_trigger_auto_manual_run", {
                            username: pb.trigger.triggered_by.username,
                            pipelineName: pb.trigger.parent_pipeline_build.pipeline.name,
                            pipelineNumber: pb.trigger.parent_pipeline_build.version
                        });
                    case BUILD_CONSTANTS.TRIGGER_AUTO_PIPELINE:
                        return $translate.instant("pipeline_trigger_auto", {
                            pipelineName: pb.trigger.parent_pipeline_build.pipeline.name,
                            pipelineNumber: pb.trigger.parent_pipeline_build.version
                        });
                    case BUILD_CONSTANTS.TRIGGER_MANUAL_HUMAN:
                        if (pb.trigger.triggered_by) {
                            return $translate.instant("pipeline_trigger_manual", { username: pb.trigger.triggered_by.username });
                        }
                        break;
                    case BUILD_CONSTANTS.TRIGGER_VCS:
                        return $translate.instant("pipeline_trigger_auto_vcs", {
                            branch: pb.trigger.vcs_branch,
                            author: pb.trigger.vcs_author
                        });
                }
            }
        };

        this.deleteBuild = function (build, index) {
            return CDSPipelineBuildRsc.delete({
                "key": self.key,
                "appName": self.appName,
                "pipName": build.pipeline.name,
                "buildId": build.build_number,
                "envName": build.environment.name
            }, function () {
                Messaging.success($translate.instant("pipeline_history_deleted"));
                self.builds.splice(index, 1);
            }, function (err) {
                Messaging.error(err);
                return $q.reject(err);
            }).$promise;
        };
    },
    templateUrl: "components/pipeline/history/history.html"
});
