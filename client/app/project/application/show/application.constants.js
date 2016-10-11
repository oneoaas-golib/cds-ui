"use strict";

angular.module("cdsApp")
    .constant("APPLICATION_CST", {
        HOOK_PLACEHOLDER: "HOST/PROJECT/repo",
        HOOK_TYPE_REPO : 1,
        HOOK_TYPE_EXTERNAL: 2
    });
