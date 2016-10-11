"use strict";

/**
 * @ngdoc controller
 * @name cdsApp.controller:WorkerModelEditCtrl
 * @requires $state, Auth, CDSWorkerModelsRsc, Messaging
 *
 * @description Manage worker listing
 *
 */
angular.module("cdsApp").controller("WorkerModelEditCtrl", function WorkerListCtrl ($q, $state, $translate, Auth, CDSWorkerModelRsc, CDSWorkerModelsRsc, CDSWorkerModelTypeRsc, CDSWorkerModelCapabilityTypeRsc, Messaging) {

    var self = this;
    this.admin = false;
    this.modelName = $state.params.modelName;
    this.model = {};
    this.modelType = [];
    this.capaType = [];
    this.selected = {};

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

    this.init = function () {
        self.loadWorkerModel();
        self.loadModelType();
        self.loadCapacities();
        Auth.isAdmin().then(function (isAdmin) {
            self.admin = isAdmin;
        });

    };
    this.init();
});
