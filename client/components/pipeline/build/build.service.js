"use strict";

angular.module("cdsApp")
    .factory("PipelineBuild", function PipelineBuildFactory (BUILD_CONSTANTS) {

        var PipelineBuild = {

            /**
             * Get Trigger By from pipeline build
             *
             * @param  {Object}   pb     - Pipeline Build
             * @return Type of trigger
             *
             */
            getTriggeredBy: function (pb) {
                if (pb && pb.trigger) {
                    if (pb.trigger.manual_trigger) {
                        return BUILD_CONSTANTS.TRIGGER_MANUAL_HUMAN;
                    } else {
                        if (pb.trigger.parent_pipeline_build) {
                            if (pb.trigger.triggered_by && pb.trigger.triggered_by.username !== "") {
                                return BUILD_CONSTANTS.TRIGGER_AUTO_HUMAN;
                            } else {
                                return BUILD_CONSTANTS.TRIGGER_AUTO_PIPELINE;
                            }
                        } else {
                            return BUILD_CONSTANTS.TRIGGER_VCS;
                        }
                    }
                }
            }
        };

        return PipelineBuild;
    });
