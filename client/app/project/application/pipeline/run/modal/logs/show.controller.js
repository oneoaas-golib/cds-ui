/*global angular*/

/**
 * @ngdoc controller
 * @name cdsApp.controller:PipelineRunLogsCtrl
 * @requires $scope, Messaging, $uibModalInstance, $translate, $interval, projectKey, pipelineName, buildID, actionID, CDSPipelineLogsRsc, logs, actionName, appName, envName
 *
 * @description
 *
 *
 */
angular.module("cdsApp").controller("PipelineRunLogsCtrl", function ($sce, $scope, Messaging, $uibModalInstance, $translate, $interval, projectKey, pipelineName, buildID, build, CDSPipelineLogsRsc, appName, envName, ansi_up) {
    "use strict";

    var self = this;
    // Refresh logs delay
    var refreshDelay = 2000;

    this.logs = "";
    this.offset = 0;
    this.callingApi = false;
    this.appName = appName;
    this.envName = envName;
    this.build = build;
    this.pipelineName = pipelineName;

    this.trustAsHtml = function (string) {
        return $sce.trustAsHtml(string);
    };

    this.loadLogs = function () {
        if (!self.callingApi) {
            self.callingApi = true;
            CDSPipelineLogsRsc.get({
                "key": projectKey,
                "appName" : appName,
                "pipName": pipelineName,
                "id": buildID,
                "actionID": self.build.pipeline_action_id,
                "offset": self.offset
            }, { "envName" : self.envName }, function (data) {
                self.callingApi = false;
                if ((data.status === "Success" || data.status === "Fail") && data.logs.length < 5000) {
                    self.stopTimer();
                }
                if (data.logs.length > 0) {
                    self.offset = data.logs[data.logs.length - 1].id;
                    for (var i = 0; i < data.logs.length; i++) {
                        self.logs += "[" + data.logs[i].timestamp + "] " + data.logs[i].value;
                    }

                    self.logs = ansi_up.ansi_to_html(self.logs);

                }
            }, function (err) {
                self.callingApi = false;
                Messaging.error(err);
                $uibModalInstance.close();
            });
        }
    };

    /**
     * @ngdoc function
     * @methodOf cdsApp.controller:PipelineRunLogsCtrl
     * @name beginRefeshTimer
     * @description Refreshing data
     *
     * Refreshing data
     */
    this.beginRefeshTimer = function () {
        if (self.timer === undefined) {
            self.timer = $interval(self.loadLogs, refreshDelay);
            $scope.$on(
                "$destroy",
                function () {
                    self.stopTimer();
                }
            );
        }
    };

    /**
     * @ngdoc function
     * @methodOf cdsApp.controller:PipelineRunLogsCtrl
     * @name stopRefeshTimer
     * @description Stop refreshing data
     *
     * Stop refreshing data
     */
    this.stopTimer = function () {
        $interval.cancel(self.timer);
        self.timer = undefined;
    };

    /**
     * @ngdoc function
     * @methodOf cdsApp.controller:PipelineRunLogsCtrl
     * @name init
     * @description Init controller
     *
     * Init controller
     */
    this.init = function () {
        self.loadLogs();
        self.beginRefeshTimer();

    };

    this.init();

    /**
     * @ngdoc function
     * @methodOf cdsApp.controller:PipelineRunLogsCtrl
     * @name ok
     * @description Close modal
     *
     * Close modal
     */
    this.ok = function () {
        $uibModalInstance.close();
    };

});
