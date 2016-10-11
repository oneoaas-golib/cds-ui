"use strict";

/**
 * @ngdoc controller
 * @name cdsApp.controller:WorkerListCtrl
 * @requires $translate, CDSWorkerModelsRsc, CDSWorkerModelRsc, CDSWorkersRsc, CDSWorkerModelTypeRsc, Messaging, Auth
 *
 * @description Manage worker listing
 *
 */
angular.module("cdsApp").controller("WorkerListCtrl", function WorkerListCtrl ($q, $rootScope, $scope, EditMode, $translate, CDSWorkerModelsRsc, CDSWorkerModelRsc, CDSWorkersRsc, CDSWorkerModelTypeRsc, Messaging, Auth, CDSApiConstants) {

    var self = this;
    this.workerModel = [];
    this.orphans = [];
    this.edit = EditMode.get();
    this.modelType = [];
    this.selected = {};

    this.building = CDSApiConstants.STATUS_BUILDING;
    this.disabled = CDSApiConstants.STATUS_DISABLED;
    this.waiting = CDSApiConstants.STATUS_WAITING;

    this.setNbWorkerByStatus = function (wm) {
        var nbBuilding = 0;
        var nbWaiting = 0;
        var nbDisabled = 0;
        if (wm.workers) {
            for (var i = 0; i < wm.workers.length; i++) {
                switch (wm.workers[i].status) {
                    case CDSApiConstants.STATUS_BUILDING:
                        nbBuilding++;
                        break;
                    case CDSApiConstants.STATUS_DISABLED:
                        nbDisabled++;
                        break;
                    case CDSApiConstants.STATUS_WAITING:
                        nbWaiting++;
                        break;
                }
            }
        }
        wm.nbBuilding = nbBuilding;
        wm.nbWaiting = nbWaiting;
        wm.nbDisabled = nbDisabled;
    };

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
                self.setNbWorkerByStatus(wm);
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

    this.init = function () {
        self.loadWorkerModel();
        self.loadModelType();
        self.loadOrphanWorker();
        Auth.isAdmin().then(function (isAdmin) {
            $rootScope.$broadcast("hideEditMode", !isAdmin);

        });

    };
    this.init();

    $scope.$on("editModeStateEvent", function (event, args) {
        self.edit = args;
    });

});
