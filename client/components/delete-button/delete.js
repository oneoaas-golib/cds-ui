"use strict";

angular.module("cdsApp").component("deleteButton", {
    bindings: {
        delete: "&",
        title: "@",
        small: "@",
        progress: "@"
    },
    controllerAs: "ctrl",
    controller: function () {
    },
    templateUrl: "components/delete-button/delete.html"
});
