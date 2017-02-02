"use strict";

angular.module("cdsApp")
    .factory("PipelineBuild", function PipelineBuildFactory () {

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
                    if (pb.trigger.triggered_by && pb.trigger.triggered_by.username) {
                        return pb.trigger.triggered_by.username;
                    }
                    if (pb.trigger.vcs_author) {
                        return pb.trigger.vcs_author;
                    }
                }
            }
        };

        return PipelineBuild;
    });
