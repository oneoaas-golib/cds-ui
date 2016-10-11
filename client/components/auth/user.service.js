"use strict";

angular.module("cdsApp")
    .factory("UserReset", function UserResource ($resource) {
        return $resource("/cdsapi/user/:name/reset", {}, {
            resetPassword: {
                method: "POST",
                isArray: false
            }
        });
    })
    .factory("UserVerify", function UserResource ($resource) {
        return $resource("/cdsapi/user/:name/confirm/:token");
    });
