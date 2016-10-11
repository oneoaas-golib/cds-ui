"use strict";

/**
 * @ngdoc controller
 * @name cdsApp.controller:ProjectShowVerifyCtrl
 * @requires $state, Messaging, CDSRepoManagerRsc, $uibModalInstance, url, repoManager, token
 *
 * @description Verify token
 *
 */
angular.module("cdsApp").controller("ProjectShowVerifyCtrl", function ProjectShowVerifyCtrl ($q, Messaging, $state, CDSRepoManagerRsc, $uibModalInstance, url, repoManager, token) {

    var self = this;
    this.url = url;
    this.repoManager = repoManager;
    this.token = token;
    this.code = "";

    /**
     * @ngdoc function
     * @methodOf cdsApp.controller:PipelineRunVariablesCtrl
     * @name ok
     * @description Close modal
     *
     * Close modal
     */
    this.close = function () {
        $uibModalInstance.close();
    };

    this.cancel = function () {
        $uibModalInstance.dismiss();
    };

    this.hasToShowInput = function () {
        return self.repoManager !== "github";
    };

    this.verif = function () {
        return CDSRepoManagerRsc.callback({ "key": $state.params.key, "repoManName": self.repoManager }, { "request_token": self.token, "verifier": self.code }, function () {
            self.close();
        }, function (err) {
            Messaging.error(err);
            return $q.reject(err);
        }).$promise;
    };
});
