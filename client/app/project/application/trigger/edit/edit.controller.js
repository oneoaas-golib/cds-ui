"use strict";

/**
 * @ngdoc controller
 * @name cdsApp.controller:TriggerEditCtrl
 * @requires $state, $translate, Messaging, CDSTriggersRsc, Project
 * @description Manage editing trigger
 *
 */
angular.module("cdsApp").controller("TriggerEditCtrl", function TriggerShowCtrl ($q, $rootScope, $scope, $state, $translate, Messaging, Project, CDSTriggersRsc, EditMode, Permission, Application) {

    var self = this;

    this.trigger = {};
    this.project = {};
    this.edit = EditMode.get();
    this.key = $state.params.key;
    this.appName = $state.params.appName;

    /**
     * @ngdoc function
     * @methodOf cdsApp.controller:TriggerEditCtrl
     * @name canWrite
     * @description Test if the current user can write
     */
    this.canWrite = function () {
        self.canEditApplication = Permission.canWrite(self.application.permission);
        $rootScope.$broadcast("hideEditMode", !self.canEditApplication);
    };

    /**
     * @ngdoc function
     * @methodOf cdsApp.controller:TriggerEditCtrl
     * @name deleteTrigger
     * @description Call api to delete the trigger
     */
    this.deleteTrigger = function () {
        return CDSTriggersRsc.delete({ "key": $state.params.key, "appName": $state.params.appName, "pipName": $state.params.pipName, "triggerId": $state.params.triggerId }, function () {
            Messaging.success($translate.instant("trigger_edit_msg_trigger_deleted"));
            $state.go("app.application-show", { "key": $state.params.key, "appName": $state.params.appName });
        }, function (err) {
            Messaging.error(err);
            return $q.reject(err);
        }).$promise;
    };

    /**
     * @ngdoc function
     * @methodOf cdsApp.controller:TriggerEditCtrl
     * @name updateTrigger
     * @description Call api to update the trigger
     */
    this.updateTrigger = function () {
        return CDSTriggersRsc.update({ "key": $state.params.key, "appName": $state.params.appName, "pipName": $state.params.pipName, "triggerId": $state.params.triggerId }, self.trigger, function () {
            Messaging.success($translate.instant("trigger_edit_msg_trigger_updated"));
            $state.go("app.application-show", { "key": $state.params.key, "appName": $state.params.appName });
        }, function (err) {
            Messaging.error(err);
            return $q.reject(err);
        }).$promise;
    };

    /**
     * @ngdoc function
     * @methodOf cdsApp.controller:TriggerEditCtrl
     * @name loadProject
     * @description Call api to load project
     */
    this.loadProject = function () {
        Project.getProject($state.params.key).then(function (data) {
            self.project = data;
        });
    };

    /**
     * @ngdoc function
     * @methodOf cdsApp.controller:TriggerEditCtrl
     * @name loadApplication
     * @description Load  application
     */
    this.loadApplication = function () {
        Application.getApplication($state.params.key, $state.params.appName).then(function (data) {
            self.application = data;
            self.canWrite();
        });
    };

    /**
     * @ngdoc function
     * @methodOf cdsApp.controller:TriggerEditCtrl
     * @name loadProject
     * @description Call api to load project
     */
    this.loadTrigger = function () {
        CDSTriggersRsc.get({ "key": $state.params.key, "appName": $state.params.appName, "pipName": $state.params.pipName, "triggerId" : $state.params.triggerId }, function (data) {
            self.trigger = data;
            if (!self.trigger.prerequisites) {
                self.trigger.prerequisites = [];
            }
            if (!self.trigger.parameters) {
                self.trigger.parameters = [];
            }
        }, function (err) {
            Messaging.error(err);
        });
    };

    this.init = function () {
        self.loadProject();
        self.loadTrigger();
        self.loadApplication();
    };

    $scope.$on("editModeStateEvent", function (event, args) {
        self.edit = args;
    });

    this.init();
});
