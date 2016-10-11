"use strict";

/**
 * @ngdoc controller
 * @name cdsApp.controller:VerifyCtrl
 * @requires Auth, $state, Messaging
 *
 * @description Manage verify token view
 *
 */
angular.module("cdsApp")
    .controller("VerifyCtrl", function LoginCtrl (Auth, $state, Messaging) {
        var self = this;

        this.confirmedData = {};
        this.errors = {};
        this.verifyIsOk = false;

        /**
         * @ngdoc function
         * @methodOf cdsApp.controller:VerifyCtrl
         * @name register
         * @description Verify user token
         */
        this.verify = function () {
            Auth.isLoggedIn(function () {
                Auth.verify($state.params.username, $state.params.token).then(function (data) {
                    self.confirmedData = angular.copy(data);
                    if (data.token) {
                        Auth.setCurrentSession(data.user, data.token);
                    }  else {
                        Auth.setCurrentUser(data.user, data.password);
                    }
                    self.verifyIsOk = true;
                }, function (err) {
                    Messaging.error(err);
                });
            });
        };
        this.verify();
    });
