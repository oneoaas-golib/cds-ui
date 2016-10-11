"use strict";

angular.module("cdsApp")
    .constant("CDSApiConstants", {
        STATUS_BUILDING: "Building",
        STATUS_DISABLED: "Disabled",
        STATUS_FAIL: "Fail",
        STATUS_NEVER_BUILT: "Never Built",
        STATUS_SUCCESS: "Success",
        STATUS_WAITING: "Waiting",
        STATUS_WARNING: "Warning"
    });
