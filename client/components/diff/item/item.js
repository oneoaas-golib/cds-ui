"use strict";

angular.module("cdsApp").component("diffItem", {
    bindings: {
        value: "@",
        type: "@",
        color: "@"
    },
    controllerAs: "ctrl",
    controller: function () {

        this.getHeight = function (value) {
            var nbReturn = 0;
            if (value) {
                nbReturn = value.split("\n").length;
            }
            return nbReturn + 1;
        };
    },
    templateUrl: "components/diff/item/item.html"
});
