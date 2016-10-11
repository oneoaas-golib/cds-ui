"use strict";

angular.module("cdsApp")
.run(function ($rootScope, $state, $uibModalStack, Auth) {
    // Redirect to login if route requires auth and the user is not logged in, or doesn't have required role
    $rootScope.$on("$stateChangeStart", function (e, next) {

        // Close modal when location change
        var top = $uibModalStack.getTop();
        if (top) {
            $uibModalStack.dismiss(top.key);
        }

        if (next.authenticate === undefined) {
            next.authenticate = true;
        }

        if (!next.authenticate) {
            return;
        }

        if (typeof next.authenticate === "string") {
            Auth.hasRole(next.authenticate, _.noop).then(function (has) {
                if (has) {
                    return;
                }

                e.preventDefault();
                return Auth.isLoggedIn(_.noop).then(function (is) {
                    $state.go(is ? "app.home" : "login");
                });
            });
        } else {
            Auth.isLoggedIn(_.noop).then(function (is) {
                if (is) {
                    return;
                }

                e.preventDefault();
                $state.go("login");
            });
        }
    });
});
