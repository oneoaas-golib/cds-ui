"use strict";

angular.module("cdsApp").component("capacityManagementDiff", {
    bindings: {
        capacities: "=",
        original: "=",
        onechange: "="
    },
    controllerAs: "ctrl",
    controller: function ($scope) {
        var self = this;
        this.added = [];
        this.removed = [];
        this.updated = [];
        this.equal = [];

        this.getColor = function (capaUpdated) {
            if (capaUpdated.old) {
                return "added";
            }
            return "";
        };

        $scope.$watch(function () {
            return self.capacities;
        }, function () {
            if (self.capacities && self.original) {
                self.added = [];
                self.removed = [];
                self.updated = [];
                self.equal = [];
                // Browse current capabilities
                self.original.forEach(function (capaOrigin) {
                    var capaAudit = _.find(self.capacities, { name: capaOrigin.name });
                    // if capa found in Audit
                    if (capaAudit) {

                        // Equal
                        if (capaAudit.type === capaOrigin.type && capaAudit.value === capaOrigin.value) {
                            self.equal.push(capaOrigin);
                        } else {
                            self.onechange = true;
                            // Updated
                            var capaUpdated = {
                                name:  capaOrigin.name,
                                type : {
                                    actual :  capaOrigin.type
                                },
                                value: {
                                    actual :  capaOrigin.value
                                }
                            };
                            if (capaAudit.type !== capaOrigin.type) {
                                capaUpdated.type.old = capaAudit.type;
                            }
                            if (capaAudit.value !== capaOrigin.value) {
                                capaUpdated.value.old = capaAudit.value;
                            }
                            self.updated.push(capaUpdated);
                        }
                    } else {
                        // added
                        self.onechange = true;
                        self.added.push(capaOrigin);
                    }
                });

                // Browse audit capabilities
                self.capacities.forEach(function (capaAudit) {
                    /// removed
                    if (!_.find(self.original, { name: capaAudit.name })) {
                        self.onechange = true;
                        self.removed.push(capaAudit);
                    }
                });
            }
        }, true);
    },
    templateUrl: "components/capacity-management/diff/diff.html"
});
