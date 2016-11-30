"use strict";

/**
 * @ngdoc controller
 * @name cdsApp.controller:WorkerListCtrl
 * @requires $translate, CDSWorkerModelsRsc, CDSWorkerModelRsc, CDSWorkersRsc, CDSWorkerModelTypeRsc, Messaging, Auth
 *
 * @description Manage worker listing
 *
 */
angular.module("cdsApp").controller("WorkerListCtrl", function WorkerListCtrl ($q, $rootScope, $state, $scope, EditMode, $translate, CDSWorkerModelsRsc, CDSWorkerModelRsc, CDSGroupsRsc, CDSWorkersRsc, CDSWorkerModelTypeRsc, CDSUserRsc, Messaging) {

    var self = this;
    this.workerModel = [];
    this.orphans = [];
    this.edit = EditMode.get();
    this.modelType = [];
    this.selected = {};
    this.existingGroups = [];
    this.allGroups = [];

    /**
     * @ngdoc function
     * @methodOf cdsApp.controller:WorkerListCtrl
     * @name addWorkerModel
     * @description Call API to add a worker model
     */
    this.addWorkerModel = function () {
        return CDSWorkerModelsRsc.save(self.selected.model, function () {
            self.workerModel.push(angular.copy(self.selected.model));
            self.selected = {};
        }, function (err) {
            Messaging.error(err);
            return $q.reject(err);
        }).$promise;
    };

    /**
     * @ngdoc function
     * @methodOf cdsApp.controller:WorkerListCtrl
     * @name removeWorkerModel
     * @description Call API to delete a worker model
     */
    this.removeWorkerModel = function (model, index) {
        CDSWorkerModelRsc.delete({ "id": model.id }, function () {
            Messaging.success($translate.instant("worker_list_model_msg_model_deleted"));
            self.workerModel.splice(index, 1);
        }, function (err) {
            Messaging.error(err);
        });
    };

    /**
     * @ngdoc function
     * @methodOf cdsApp.controller:WorkerListCtrl
     * @name loadWorkerModel
     * @description Load worker with model
     */
    this.loadWorkerModel = function () {
        CDSWorkerModelsRsc.query(function (data) {
            self.workerModel = data;
            self.workerModel.forEach(function (wm) {
                self.allGroups.forEach(function (g) {
                    if (g.id === wm.group_id) {
                        wm.group = g.name;
                    }
                });
            });
        }, function (err) {
            Messaging.error(err);
        });
    };

    /**
     * @ngdoc function
     * @methodOf cdsApp.controller:WorkerListCtrl
     * @name loadOrphanWorker
     * @description Load worker without model
     */
    this.loadOrphanWorker = function () {
        CDSWorkersRsc.loadOrphanWorkers(function (data) {
            self.orphans = data;
        }, function (err) {
            Messaging.error(err);
        });
    };

    /**
     * @ngdoc function
     * @methodOf cdsApp.controller:WorkerListCtrl
     * @name loadModelType
     * @description Load model type
     *
     * load model type
     */
    this.loadModelType = function () {
        CDSWorkerModelTypeRsc.query(function (data) {
            self.modelType = data;
        }, function (err) {
            Messaging.error(err);
        });
    };

    /**
     * @ngdoc function
     * @name loadExistingGroups
     * @description Call API to get all existing groups
     */
    this.loadExistingGroups = function () {
        CDSUserRsc.getGroups({ "userName": $state.params.userName }, {}, function (data) {
            self.existingGroups = data.groups_admin;
        }, function (err) {
            Messaging.error(err);
        });
    };

    /**
     * @ngdoc function
     * @name loadAllGroups
     * @description Call API to get all groups
     */
    this.loadAllGroups = function () {
        CDSGroupsRsc.withPublic({}, {}, function (data) {
            self.allGroups = data;
        }, function (err) {
            Messaging.error(err);
        });
    };

    this.init = function () {
        self.loadAllGroups();
        self.loadExistingGroups();
        self.loadWorkerModel();
        self.loadModelType();
        self.loadOrphanWorker();
    };
    this.init();

    $scope.$on("editModeStateEvent", function (event, args) {
        self.edit = args;
    });

});
