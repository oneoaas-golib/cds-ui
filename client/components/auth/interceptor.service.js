"use strict";

angular.module("cdsApp")
.factory("authInterceptor", function authInterceptor ($rootScope, $q, $injector, $localStorage, COOKIE_KEY, SESSION_KEY) {
    var state;
    return {
        // Add authorization token to headers
        request: function (config) {
            config.headers = config.headers || {};
            if ($localStorage[SESSION_KEY]) {
                config.headers[SESSION_KEY] = $localStorage[SESSION_KEY];
            } else if ($localStorage[COOKIE_KEY]/* && isSameOrigin(config.url)*/) {
                config.headers.Authorization = $localStorage[COOKIE_KEY].token;
            }
            return config;
        },

        // Intercept 401s and redirect you to login
        responseError: function (response) {
            if (response.status === 401) {
                (state || (state = $injector.get("$state"))).go("login");
                // remove any stale tokens
                $localStorage[COOKIE_KEY] = null;
                $localStorage[SESSION_KEY] = null;
            }
            return $q.reject(response);
        }
    };
});
