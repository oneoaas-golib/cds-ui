"use strict";

/**
 * @ngdoc controller
 * @name cdsApp.controller:PasswordCtrl
 * @requires Auth, $state, Messaging
 *
 * @description Manage forgotten password view
 *
 */
angular.module("cdsApp")
    .controller("PasswordCtrl", function LoginCtrl (Auth, $state, Messaging) {
        //start-non-standard
        this.user = {};
        this.errors = {};
        this.submitted = false;
        //end-non-standard

        /**
         * @ngdoc function
         * @methodOf cdsApp.controller:PasswordCtrl
         * @name resetPassword
         * @description Reset user password
         */
        this.resetPassword = function resetPassword (form) {
            this.submitted = true;

            if (form.$valid) {
                return Auth.resetPassword({ "user": this.user, "callback" : Auth.getVerifyUrl() }).then(function () {
                    // Logged in, redirect to home
                    $state.go("waiting");
                })
                    .catch(function (err) {
                        Messaging.error(err);
                    });
            }
        };
    });
