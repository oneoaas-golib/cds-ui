/*global angular*/

/**
 * @ngdoc controller
 * @name cdsApp.controller:DetachModalCtrl
 * @requires
 *
 * @description
 *
 *
 */
angular.module("cdsApp").controller("DetachModalCtrl", function (Messaging, $state, $uibModalInstance, CDSApplicationTreeRsc, applicationID, pipeline) {
    "use strict";

    var self = this;
    this.applicationID = applicationID;
    this.pipeline = pipeline;
    this.listTrigger = [];

    this.loadWorkflow = function () {
        CDSApplicationTreeRsc.query({ "key": $state.params.key, "appName": $state.params.appName }, function (data) {
            self.checkTrees(data);
        }, function (err) {
            Messaging.error(err);
        });
    };

    this.checkTrees = function (trees) {
        if (trees && trees.length > 0) {
            trees.forEach(function (item) {
                addInTriggerList(item, false);
            });
        }
    };

    function addInTriggerList (item, sub) {
        if (sub) {
            if (item.trigger.src_application.id === self.applicationID && item.trigger.src_pipeline.id === self.pipeline.id) {
                self.listTrigger.push(item);
            } else if (item.trigger.dest_application.id === self.applicationID && item.trigger.dest_pipeline.id === self.pipeline.id) {
                self.listTrigger.push(item);
            }
        }
        if (item.subPipelines) {
            item.subPipelines.forEach(function (sb) {
                addInTriggerList(sb, true);
            });
        }
    }

    /**
     * @ngdoc function
     * @methodOf cdsApp.controller:DetachModalCtrl
     * @name init
     * @description Init controller
     *
     * Init controller
     */
    this.init = function () {
        self.loadWorkflow();

    };

    this.init();

    this.ok = function () {
        $uibModalInstance.close();
    };

    this.cancel = function () {
        $uibModalInstance.dismiss();
    };

});
