"use strict";

/**
 * @ngdoc controller
 * @name cdsApp.controller:WorkerModelEditCtrl
 * @requires $state, Auth, CDSWorkerModelsRsc, Messaging
 *
 * @description Manage worker listing
 *
 */
angular.module("cdsApp").controller("WorkerModelEditCtrl", function WorkerListCtrl ($q, $state, $translate, Auth, CDSWorkerModelRsc, CDSWorkerModelsRsc, CDSGroupsRsc, CDSWorkerModelTypeRsc, CDSWorkerModelCapabilityTypeRsc, CDSUserRsc, Messaging) {

    var self = this;
    this.modelName = $state.params.modelName;
    this.model = {};
    this.modelType = [];
    this.capaType = [];
    this.selected = {};
    this.existingGroups = [];
    this.hasRight = false;
    this.workers = [];
    this.allGroups = [];

    /**
     * @ngdoc function
     * @methodOf cdsApp.controller:WorkerModelEditCtrl
     * @name deleteModel
     * @description Call api to delete the model
     *
     */
    this.deleteModel = function () {
        return CDSWorkerModelRsc.delete({ "id": self.model.id }, function () {
            Messaging.success($translate.instant("model_edit_msg_deleted"));
            $state.go("app.worker-list");
        }, function (err) {
            Messaging.error(err);
            return $q.reject(err);
        }).$promise;
    };

    /**
     * @ngdoc function
     * @methodOf cdsApp.controller:WorkerModelEditCtrl
     * @name submit
     * @description Submit form and call api to update the worker model
     *
     */
    this.submit = function submit (form) {
        this.submitted = true;
        if (form.$valid) {
            return CDSWorkerModelRsc.update({ "id": self.model.id }, self.model, function () {
                if (self.model.name !== $state.params.modelName) {
                    $state.go("app.worker-model-edit", { "modelName": self.model.name }, { reload: true });
                }
            }, function (err) {
                Messaging.error(err);
                return $q.reject(err);
            }).$promise;
        }
        return $q.reject("Wrong form");
    };

    /**
     * @ngdoc function
     * @methodOf cdsApp.controller:WorkerModelEditCtrl
     * @name deleteCapability
     * @description Remove a capacity to the worker model
     *
     */
    this.deleteCapability = function (index) {
        self.model.capabilities.splice(index, 1);
    };

    /**
     * @ngdoc function
     * @methodOf cdsApp.controller:WorkerModelEditCtrl
     * @name addCapability
     * @description Add a new capacity to the worker model
     *
     */
    this.addCapability = function () {
        if (!self.model.capabilities) {
            self.model.capabilities = [];
        }
        self.model.capabilities.push(angular.copy(self.selected.capa));
        delete(self.selected.capa);
    };

    /**
     * @ngdoc function
     * @methodOf cdsApp.controller:WorkerModelEditCtrl
     * @name loadModelType
     * @description Load model type
     *
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
     * @methodOf cdsApp.controller:WorkerModelEditCtrl
     * @name loadWorkerModel
     * @description Load worker model
     *
     */
    this.loadWorkerModel = function () {
        CDSWorkerModelsRsc.get({ "name": $state.params.modelName }, {}, function (data) {
            self.model = data;
            self.loadExistingGroups();
        }, function (err) {
            Messaging.error(err);
        });
    };

    /**
     * @ngdoc function
     * @methodOf cdsApp.controller:WorkerModelEditCtrl
     * @name loadCapacities
     * @description Load all capacity type
     *
     */
    this.loadCapacities = function () {
        CDSWorkerModelCapabilityTypeRsc.query(function (data) {
            self.capaType = data;
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
            self.existingGroups.forEach(function (g) {
                if (g.id === self.model.group_id) {
                    self.hasRight = true;
                }
            });
            if (self.hasRight) {
                self.loadWorkerModelInstance();
            }
        }, function (err) {
            Messaging.error(err);
        });
    };

    /**
     * @ngdoc function
     * @methodOf cdsApp.controller:loadWorkerModelInstance
     * @name loadWorkerModelRights
     * @description Load worker model instance for current model
     *
     */
    this.loadWorkerModelInstance = function () {
        CDSWorkerModelRsc.getInstances({ "id": self.model.id }, function (data) {
            self.workers = data;
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
        self.loadWorkerModel();
        self.loadModelType();
        self.loadCapacities();
        self.loadAllGroups();
    };

    this.init();
});
