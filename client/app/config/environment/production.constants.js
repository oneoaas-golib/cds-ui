"use strict";

angular.module("cdsApp").constant("CONFIG", {
    env           : "production",
    apiRouteBase  : "../api",
    loginUrl      : "auth.html",
    basePathRegex : undefined       // RegExp or array of RegExp to configure the HTML5 base path
});
