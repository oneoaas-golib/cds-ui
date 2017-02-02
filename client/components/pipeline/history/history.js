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
                return PipelineBuild.getTriggeredBy(pb);
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
