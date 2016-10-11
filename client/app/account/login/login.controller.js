"use strict";

/**
 * @ngdoc controller
 * @name cdsApp.controller:LoginCtrl
 * @requires Auth, $state, Messaging
 *
 * @description Manage user login
 *
 */
angular.module("cdsApp")
    .controller("LoginCtrl", function LoginCtrl (Auth, $state, Messaging) {
        //start-non-standard
        this.user = {};
        this.errors = {};
        this.submitted = false;
        //end-non-standard

        /**
         * @ngdoc function
         * @methodOf cdsApp.controller:LoginCtrl
         * @name login
         * @description User login
         */
        this.login = function login (form) {
            this.submitted = true;

            if (form.$valid) {
                return Auth.login(this.user).then(function () {
                    // Logged in, redirect to home
                    $state.go("app.home");
                })
                    .catch(function (err) {
                        Messaging.error(err);
                    });
            }
        };
    });
