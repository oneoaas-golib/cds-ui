"use strict";

angular.module("cdsApp").component("action", {
    bindings: {
        action: "=",
        audit: "=",
        suggest: "=",
        done: "&",
        showparams: "@",
        warning: "=",
        tab: "=",
        updateurl: "&",
        withaudit: "@"
    },
    controllerAs: "ctrl",
    controller: function ($state, $q, $scope, $translate, CDSActionRsc, Messaging, EditMode, URLS, $uibModal) {
        var self = this;

        this.coreActions = [];
        this.edit = EditMode.get();

        this.getHeight = function (value) {
            var nbReturn = 0;
            if (value) {
                nbReturn = value.split("\n").length;
            }
            return nbReturn < 7 ? 7 : nbReturn;
        };

        this.linkRequirements = URLS.requirementlink;

        this.sortableOptions = {
            handle: ".myHandle"
        };

        this.hasBeenUpdated = function (audit) {
            return audit.capaUpdated || audit.paramUpdated || audit.stepUpdated || audit.action.name !== self.action.name || audit.action.description !== self.action.description;
        };

        this.getDescription = function (description) {
            return description.replace(/[^\n]+/g, function (replacement) {
                return "<p>" + replacement + "</p>";
            });
        };

        this.openConfirmationAuditModal = function (action) {
            var modalInstance = $uibModal.open({
                animation: true,
                templateUrl: "components/action/modal/confirmaudit.html",
                controller: "ConfirmAuditCtrl",
                controllerAs: "ctrl",
                size: "lg",
                resolve: {
                    action: function () {
                        return action;
                    }
                }
            });

            modalInstance.result.then(function () {
                return self.done({ ACTION: action });
            });
        };

        /**
         * @ngdoc function
         * @name addAction
         * @description Add a subaction to the current action
         */
        this.addAction = function () {
            if (!self.action.actions) {
                self.action.actions = [];
            }
            var scriptAction = _.find(self.coreActions,  { "name" : "Script" });
            if (scriptAction) {
                scriptAction.final = false;
                scriptAction.enabled = true;
                self.action.actions.push(angular.copy(scriptAction));
            } else {
                var newAction = self.coreActions[0];
                newAction.final = false;
                newAction.enabled = true;
                self.action.actions.push(angular.copy(newAction));
            }

        };

        /**
         * @ngdoc function
         * @name removeStep
         * @description Remove a subactions
         */
        this.removeStep = function (a) {
            self.action.actions.forEach(function (act, i) {
                if (act === a) {
                    self.action.actions.splice(i, 1);
                }
            });

        };

        /**
         * @ngdoc function
         * @name onSelectAction
         * @description Attach new action
         */
        this.onSelectAction = function (selectedAction, index, finalAction) {
            var cpt = 0;
            self.action.actions.forEach(function (a, i) {
                if (cpt === index && a.final === finalAction) {
                    self.action.actions[i] = angular.copy(selectedAction);
                    cpt++;
                }  else if (a.final !== finalAction) {
                    return;
                }  else {
                    cpt++;
                }
            });
            var actions = _.filter(self.action.actions, { final: finalAction });
            actions[index] = angular.copy(selectedAction);
        };

        /**
         * @ngdoc function
         * @name submit
         * @description Submit form
         */
        this.submit = function submit (form) {
            this.submitted = true;
            if (form.$valid) {
                return self.done({ ACTION: self.action });
            }
            return $q.reject("Wrong form");
        };

        /**
         * @ngdoc function
         * @name loadAction
         * @description Load all CDS core actions
         */
        this.loadAction = function () {
            CDSActionRsc.query(function (data) {
                self.coreActions = data;
            }, function (err) {
                Messaging.error(err);
            });
        };

        this.selectTab = function (tab) {
            switch (tab) {
                case "action":
                    self.activeTab = 0;
                    self.tab = "action";
                    break;
                case "audit":
                    self.activeTab = 1;
                    self.tab = "audit";
                    break;
            }
            self.updateurl({ TAB: self.tab });
        };

        this.init = function () {
            this.loadAction();
            switch (self.tab) {
                case "action":
                    self.activeTab = 0;
                    break;
                case "audit":
                    self.activeTab = 1;
                    break;
            }
        };
        this.init();

        $scope.$on("editModeStateEvent", function (event, args) {
            self.edit = args;
        });
    },
    templateUrl: "components/action/action.html"
});
