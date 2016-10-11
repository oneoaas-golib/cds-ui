"use strict";

/**
 * @ngdoc controller
 * @name cdsApp.controller:ConfirmAuditCtrl
 * @requires $uibModalInstance, action
 *
 * @description Manage show pipeline view
 *
 */
angular.module("cdsApp").controller("ConfirmAuditCtrl", function PipelineShowCtrl ($uibModalInstance, action) {

    var self = this;
    self.action = action;

    self.ok = function () {
        $uibModalInstance.close();
    };

    self.cancel = function () {
        $uibModalInstance.dismiss("cancel");
    };
});
