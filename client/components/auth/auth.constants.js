"use strict";

angular.module("cdsApp")
.constant("USER_ROLES", ["user", "admin"]);

angular.module("cdsApp")
    .constant("COOKIE_KEY", "CDS-User");

angular.module("cdsApp")
    .constant("SESSION_KEY", "Session-Token");
