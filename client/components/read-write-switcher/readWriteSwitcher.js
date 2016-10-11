"use strict";

angular.module("cdsApp").component("readWriteSwitcher", {
    bindings: {
    },
    controllerAs: "ctrl",
    controller: function ($scope, $state, $translate, EditMode) {
        var self = this;
        this.edit = EditMode.get();

        this.changeEditMode = function (newValue) {
            EditMode.switch(newValue);
        };

        $scope.$on("editModeStateEvent", function (event, args) {
            self.edit = args;
        });
    },
    templateUrl: "components/read-write-switcher/readWriteSwitcher.html"
});
