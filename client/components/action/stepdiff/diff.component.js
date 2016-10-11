"use strict";

angular.module("cdsApp").component("actionStepDiff", {
    bindings: {
        steps: "=",
        original: "=",
        onechange: "="
    },
    controllerAs: "ctrl",
    controller: function ($scope) {
        var self = this;
        this.allStep = [];
        this.empty = [];

        this.getColor = function (stepUpdated) {
            if (stepUpdated.old) {
                return "added";
            }
            return "";
        };

        $scope.$watch(function () {
            return self.steps;
        }, function () {
            if (self.steps && self.original) {
                var updatedTmp = [];
                self.allStep = [];
                // Browse current steps
                self.original.forEach(function (stepOrigin, i) {
                    var stepsAudit = _.filter(self.steps, { id: stepOrigin.id });
                    if (stepsAudit && stepsAudit.length > 0) {
                        if (stepOrigin.parameters) {
                            stepOrigin.parameters.forEach(function (p) {
                                delete p.showButton;
                            });
                        }
                        var identicalParams = _.find(stepsAudit, { parameters: stepOrigin.parameters });
                        if (identicalParams && identicalParams.final.toString() === stepOrigin.final.toString() && identicalParams.enabled.toString() === stepOrigin.enabled.toString()) {
                            stepOrigin.state = "equal";
                            self.allStep.push(stepOrigin);
                        } else {
                            self.onechange = true;
                            stepOrigin._index = i;
                            updatedTmp.push(stepOrigin);
                        }
                    } else {
                        // added new type of step
                        self.onechange = true;
                        stepOrigin.state = "added";
                        self.allStep.push(stepOrigin);
                    }
                });

                var nonUseAudit = [];
                self.steps.forEach(function (stepAudit) {
                    var stepsOrigins = _.filter(self.original, { id: stepAudit.id });
                    if (!stepsOrigins || stepsOrigins.length === 0) {
                        stepAudit.state = "removed";
                        self.onechange = true;
                        self.allStep.push(stepAudit);
                    }
                    var identicalParams = _.find(stepsOrigins, { parameters: stepAudit.parameters });
                    if (!(identicalParams && identicalParams.final.toString() === stepAudit.final.toString() && identicalParams.enabled.toString() === stepAudit.enabled.toString())) {
                        nonUseAudit.push(stepAudit);
                    }
                });

                if (updatedTmp.length > 0) {
                    updatedTmp.forEach(function (u) {
                        var done = false;
                        for (var i = 0; i < nonUseAudit.length; i++) {
                            if (u.id === nonUseAudit[i].id) {
                                done = true;
                                var stepUpdate = {
                                    name : u.name,
                                    description : u.description,
                                    final : {
                                        actual: u.final
                                    },
                                    enabled: {
                                        actual: u.enabled
                                    },
                                    parameters: {
                                        actual: u.parameters
                                    }
                                };
                                if (u.final.toString() !== nonUseAudit[i].final.toString()) {
                                    stepUpdate.final.old = nonUseAudit[i].final;
                                }
                                if (u.enabled.toString() !== nonUseAudit[i].enabled.toString()) {
                                    stepUpdate.enabled.old = nonUseAudit[i].enabled;
                                }
                                if (u.parameters !== nonUseAudit[i].parameters) {
                                    stepUpdate.parameters.old = nonUseAudit[i].parameters;
                                }
                                stepUpdate.state = "updated";
                                self.allStep.splice(u._index, 0, stepUpdate);
                                nonUseAudit.splice(i, 1);
                                break;
                            }
                        }
                        if (!done) {
                            u.state = "added";
                            self.allStep.splice(u._index, 0, u);
                        }
                    });
                }

                if (nonUseAudit.length > 0) {
                    nonUseAudit.forEach(function (toRemove) {
                        toRemove.state = "removed";
                        self.allStep.push(toRemove);
                    });
                }
            }
        }, true);
    },
    templateUrl: "components/action/stepdiff/diff.html"
});
