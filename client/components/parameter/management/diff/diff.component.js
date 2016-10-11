"use strict";

angular.module("cdsApp").component("parameterManagementDiff", {
    bindings: {
        params: "=",
        original: "=",
        type: "@",
        description: "@",
        onechange: "=",
        title: "@"
    },
    controllerAs: "ctrl",
    controller: function ($scope) {

        var self = this;
        this.added = [];
        this.removed = [];
        this.updated = [];
        this.equal = [];

        this.getColor = function (paramUpdated) {
            if (paramUpdated.old) {
                return "added";
            }
            return "";
        };

        $scope.$watch(function () {
            return self.params;
        }, function () {
            if (self.params && self.original) {
                self.added = [];
                self.removed = [];
                self.updated = [];
                self.equal = [];
                // Browse current parameters
                self.original.forEach(function (paramOrigin) {
                    delete paramOrigin._index;
                    var paramAudit = _.find(self.params, { name: paramOrigin.name });
                    // if param found in Audit
                    if (paramAudit) {
                        // Equal
                        if (paramAudit.type === paramOrigin.type && paramAudit.value.toString() === paramOrigin.value.toString() && paramAudit.description === paramOrigin.description) {
                            self.equal.push(paramOrigin);
                        } else {
                            self.onechange = true;
                            // Updated
                            var paramUpdated = {
                                name:  paramOrigin.name,
                                type : {
                                    actual :  paramOrigin.type
                                },
                                value: {
                                    actual :  paramOrigin.value
                                },
                                description: {
                                    actual : paramOrigin.description
                                }
                            };
                            if (paramOrigin.type !== paramAudit.type) {
                                paramUpdated.type.old = paramAudit.type;
                            }
                            if (paramOrigin.value.toString() !== paramAudit.value.toString()) {
                                paramUpdated.value.old = paramAudit.value;
                            }
                            if (paramOrigin.description !== paramAudit.description) {
                                paramUpdated.description.old = paramAudit.description;
                            }
                            self.updated.push(paramUpdated);
                        }
                    } else {
                        // added
                        self.onechange = true;
                        self.added.push(paramOrigin);
                    }
                });

                // Browse audit params
                self.params.forEach(function (paramAudit) {
                    /// removed
                    if (!_.find(self.original, { name: paramAudit.name })) {
                        self.onechange = true;
                        self.removed.push(paramAudit);
                    }
                });
            }
        }, true);
    },
    templateUrl: "components/parameter/management/diff/diff.html"
});
