"use strict";

/**
 * @ngdoc controller
 * @name cdsApp.controller:ActionListCtrl
 * @requires CDSActionsRsc
 *
 * @description Manage action listing
 *
 */
angular.module("cdsApp").controller("ActionListCtrl", function ActionListCtrl ($translate, $interval, $q, $scope, $state, Auth, CDSActionRsc, Messaging, EditMode, Upload) {

    var self = this;

    this.actions = [];
    this.newAction = {};
    this.admin = false;
    this.edit = EditMode.get();

    /**
     * @ngdoc function
     * @methodOf cdsApp.controller:ActionListCtrl
     * @name submit
     * @description Create new action
     */
    this.submit = function submit (form) {
        this.submitted = true;
        if (form.$valid) {
            return CDSActionRsc.save({ "actionName": self.newAction.name }, self.newAction, function () {
                self.goToActionShow(self.newAction);
            }, function (err) {
                Messaging.error(err);
                return $q.reject(err);
            }).$promise;
        }
        return $q.reject("Wrong form");
    };

    this.uploadArtifact = function () {
        var res = $q.defer();
        var progressButton = 0;

        var interval = $interval(function () {
            res.notify(progressButton);
        }, 100);

        var method = "POST";
        if (_.find(self.actions, { name: self.file.name })) {
            method = "PUT";
        }
        Upload.upload({
            url: "/cdsapi/plugin",
            method: method,
            data: { UploadFile: self.file }
        }).then(function () {
            $interval.cancel(interval);
            res.resolve();
            if (method === "PUT") {
                Messaging.success($translate.instant("action_list_msg_plugin_updated"));
            }
            delete self.file;
            self.loadActions();
        }, function (err) {
            Messaging.error(err);
            $interval.cancel(interval);
            res.reject();
            delete self.file;
        }, function (evt) {
            progressButton = parseInt(100.0 * evt.loaded / evt.total, 10);
        });

        return res.promise;
    };

    /**
     * @ngdoc function
     * @methodOf cdsApp.controller:ActionListCtrl
     * @name goToActionShow
     * @description Go to action show view
     */
    this.goToActionShow = function (action) {
        $state.go("app.action-show", { "actionName": action.name, "tab": "action" });
    };

    /**
     * @ngdoc function
     * @methodOf cdsApp.controller:ActionListCtrl
     * @name loadActions
     * @description Call API to load admin actions
     */
    this.loadActions = function () {
        CDSActionRsc.query(function (data) {
            self.actions = data;
        }, function (err) {
            Messaging.error(err);
        });
    };

    this.init = function () {
        self.loadActions();
        Auth.isAdmin().then(function (isAdmin) {
            self.admin = isAdmin;
        });
    };
    this.init();

    $scope.$on("editModeStateEvent", function (event, args) {
        self.edit = args;
    });
});
