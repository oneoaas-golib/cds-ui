"use strict";

angular.module("cdsApp").component("capacityManagement", {
    bindings: {
        capacities: "=",
        warning: "=",
        edit: "@"
    },
    controllerAs: "ctrl",
    controller: function ($scope, $translate, CDSWorkerModelCapabilityTypeRsc, Messaging, CDSWorkerModelsRsc, WARNING_TYPE) {
        var self = this;

        this.capacityTypes = [];
        this.isWriting = false;
        this.workerModels = [];

        this.hasRequirementError = function () {
            var hasWarning = false;
            if (self.warning) {
                self.warning.forEach(function (w) {
                    switch (w.id) {
                        case WARNING_TYPE.NoWorkerModelMatchRequirement:
                        case WARNING_TYPE.MultipleWorkerModelWarning:
                            hasWarning = true;
                            break;
                    }
                });
            }
            return hasWarning;
        };

        this.updateFromName = function (c) {
            if (this.isWriting || ((!c.value || c.value === "") && c.type === "binary")) {
                this.isWriting = true;
                c.value = c.name;
            }
        };

        this.updateFromValue = function (c) {
            if (this.isWriting || ((!c.name || c.name === "") && c.type === "binary")) {
                this.isWriting = true;
                c.name = c.value;
            }
        };

        /**
         * @ngdoc function
         * @name addCapacity
         * @description Add a capacity
         */
        this.addCapacity = function () {
            if (!self.capacities) {
                self.capacities = [];
            }
            self.capacities.push({
                name : "",
                type : self.capacityTypes[0],
                value: ""
            });
        };

        /**
         * @ngdoc function
         * @name removeCapacity
         * @description Remove a capacity
         */
        this.removeCapacity = function (index) {
            self.capacities.splice(index, 1);
        };

        /**
         * @ngdoc function
         * @name loadCapacities
         * @description Load all capacities
         */
        this.loadCapacities = function () {
            CDSWorkerModelCapabilityTypeRsc.query(function (data) {
                self.capacityTypes = data;
            }, function (err) {
                Messaging.error(err);
            });
        };

        this.loadModels = function () {
            CDSWorkerModelsRsc.query(function (data) {
                self.workerModels = data;
            }, function (err) {
                Messaging.error(err);
            });
        };

        this.init = function () {
            this.loadCapacities();
            this.loadModels();
        };
        this.init();
    },
    templateUrl: "components/capacity-management/capacity.html"
});
