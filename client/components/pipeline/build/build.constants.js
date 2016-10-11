"use strict";

angular.module("cdsApp")
.constant("BUILD_CONSTANTS", {
    TRIGGER_MANUAL_HUMAN: 0,
    TRIGGER_AUTO_HUMAN: 1,
    TRIGGER_AUTO_PIPELINE: 2,
    TRIGGER_VCS: 3
});
