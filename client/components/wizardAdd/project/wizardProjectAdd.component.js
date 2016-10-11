"use strict";

angular.module("cdsApp").component("wizardProjectAdd", {
    bindings: {
        project : "=",
        done : "&",
        buttontitle : "@"
    },
    controllerAs: "wz",
    controller: function ($translate, $location) {
        var self = this;
        this.empty = false;
        this.keyPattern = new RegExp("^[A-Z0-9]*$");

        /**
         * @ngdoc function
         * @name generateKey
         * @description Auto generate project key from project name
         *
         * Auto generate project key from project name
         */
        this.generateKey = function () {
            if (!self.project.name) {
                return;
            }
            if (self.project.key === undefined) {
                self.project.key = "";
            }
            if (self.project.key.length >= 5) {
                return;
            }
            self.project.key = self.project.name.toUpperCase();
            self.project.key = self.project.key.replace(/([.,; *`§%&#_\-'+?^=!:$\\"{}()|\[\]\/\\])/g, "").substr(0, 5);
        };

        /**
         * @ngdoc function
         * @name getUrl
         * @description Get current URL
         */
        this.getUrl = function () {
            return $location.absUrl() + "/";
        };

        /**
         * @ngdoc function
         * @name submit
         * @description Submit form
         */
        this.submit = function submit (form) {
            this.submitted = true;
            if (form.$valid) {
                self.done({ EMPTY: self.empty });
            }
        };
    },
    templateUrl: "components/wizardAdd/project/wizardProjectAdd.html"
});
