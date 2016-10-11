"use strict";

/**
 * @ngdoc controller
 * @name cdsApp.controller:SignupCtrl
 * @requires Auth, $state, Messaging
 *
 * @description Manage user signup
 *
 */
angular.module("cdsApp")
    .controller("SignupCtrl", function SignupCtrl (Auth, $state, Messaging) {

        //start-non-standard
        this.user = {};
        this.errors = {};
        this.submitted = false;
        //end-non-standard

        /**
         * @ngdoc function
         * @methodOf cdsApp.controller:SignupCtrl
         * @name register
         * @description Create new user
         */
        this.register = function register (form) {
            this.submitted = true;
            if (form.$valid) {
                return Auth.createUser({ "user": this.user, "callback": Auth.getVerifyUrl() })
                    .then(function () {
                        $state.go("waiting");
                    }, function (err) {
                        Messaging.error(err);
                    });
            }
        };
    });
