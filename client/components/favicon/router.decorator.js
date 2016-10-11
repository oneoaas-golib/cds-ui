"use strict";

angular.module("cdsApp")
.run(function ($rootScope, favicon) {
    $rootScope.$on("$stateChangeStart", function (e, next, nextValue, from) {
        if (from.name === "app.application-pipeline-build") {
            favicon.restore();
        }

    });
});
