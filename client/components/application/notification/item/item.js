"use strict";

angular.module("cdsApp").component("notificationItem", {
    bindings: {
        type: "=",
        content: "=",
        states: "=",
        suggest: "=",
        edit: "@"
    },
    controllerAs: "ctrl",
    controller: function () {
    },
    templateUrl: "components/application/notification/item/item.html"
});
