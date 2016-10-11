"use strict";

angular.module("cdsApp").component("wizardPermissionAdd", {
    bindings: {
        project : "=",
        done : "&",
        buttontitle : "@"
    },
    controllerAs: "wz",
    controller: function () {
        var self = this;

        this.checkGroups = function () {
            if (self.project.groups && self.project.groups.length > 0) {
                for (var i = 0; i < self.project.groups.length; i++) {
                    if (!self.project.groups[i].group.name || self.project.groups[i].group.name === "") {
                        return false;
                    }
                }
                return true;
            }
            return false;
        };

        /**
         * @ngdoc function
         * @name submit
         * @description Submit form
         */
        this.submit = function submit (form) {
            this.submitted = true;

            if (form.$valid && self.checkGroups()) {
                self.done();
            }
        };
    },
    templateUrl: "components/wizardAdd/permission/wizardPermissionAdd.html"
});
