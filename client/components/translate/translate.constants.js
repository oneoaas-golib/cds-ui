"use strict";

angular.module("cdsApp").constant("LANGUAGES", {
    "available" : [{
        name: "English (United States)",
        key : "en_US"
    }, {
        name: "Français",
        key : "fr_FR"
    }],
    "default"   : "en_US",
    "fallback"  : "en_US"
});
