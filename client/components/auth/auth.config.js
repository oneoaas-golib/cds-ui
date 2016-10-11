"use strict";

angular.module("cdsApp")
.config(function ($httpProvider) {
    $httpProvider.interceptors.push("authInterceptor");
});

