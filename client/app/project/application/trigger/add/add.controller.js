"use strict";

/**
 * @ngdoc controller
 * @name cdsApp.controller:TriggerAddCtrl
 * @requires $state, $translate, Messaging, Application, CDSTriggersRsc, Project
 * @description Manage adding trigger
 *
 */
angular.module("cdsApp").controller("TriggerAddCtrl", function TriggerShowCtrl ($q, $state, $translate, Messaging, CDSTriggersRsc, Project) {

    var self = this;

    this.trigger = {};
    this.project = {};
    this.key = $state.params.key;
    this.appName = $state.params.appName;

    /**
     * @ngdoc function
     * @methodOf cdsApp.controller:TriggerAddCtrl
     * @name submit
     * @description Submit form
     */
    this.insertTrigger = function () {
        return CDSTriggersRsc.save({ "key": $state.params.key, "appName": $state.params.appName, "pipName": $state.params.pipName }, self.trigger, function () {
            Messaging.success($translate.instant("trigger_add_msg_trigger_saved"));
            $state.go("app.application-show", { "key": $state.params.key, "appName": $state.params.appName });
        }, function (err) {
            Messaging.error(err);
            return $q.reject(err);
        }).$promise;
    };

    /**
     * @ngdoc function
     * @methodOf cdsApp.controller:TriggerAddCtrl
     * @name loadProject
     * @description Call api to load project
     */
    this.loadProject = function () {
        Project.getProject($state.params.key).then(function (data) {
            self.project = data;
            self.trigger = {
                src_project : { key : $state.params.key, name: self.project.name },
                src_application : { name : $state.params.appName },
                src_pipeline : _.find(self.project.pipelines, { name : $state.params.pipName }),
                src_environment: { name: $state.params.env },
                dest_project : { key : $state.params.key, name: self.project.name }
            };
        });
    };

    this.init = function () {
        self.loadProject();
    };

    this.init();
});
