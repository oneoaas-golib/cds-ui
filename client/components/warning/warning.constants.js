"use strict";
angular.module("cdsApp")
    .constant("WARNING_TYPE", {
        MultipleWorkerModelWarning: 1,
        NoWorkerModelMatchRequirement: 2,
        InvalidVariableFormat: 3,
        ProjectVariableDoesNotExist: 4,
        ApplicationVariableDoesNotExist: 5,
        EnvironmentVariableDoesNotExist: 6,
        CannotUseEnvironmentVariable: 7
    });
