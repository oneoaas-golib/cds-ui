"use strict";

/**
 * @ngdoc controller
 * @name cdsApp.controller:ActionShowCtrl
 * @requires $state, $translate, CDSActionRsc, Messaging, Auth
 *
 * @description Manage action listing
 *
 */
angular.module("cdsApp").controller("ActionShowCtrl", function ActionShowCtrl ($q, $scope, $rootScope, $state, $translate, CDSActionRsc, Messaging, Auth, ParameterService, EditMode, CDSPluginRsc) {

    var self = this;

    this.action = {};
    this.edit = false;
    this.admin = false;
    this.pipelines = [];
    this.edit = EditMode.get();

    /**
     * @ngdoc function
     * @methodOf cdsApp.controller:ActionShowCtrl
     * @name loadAction
     * @description Call API to load current action
     */
    this.loadAction = function () {
        CDSActionRsc.get({ actionName: $state.params.actionName }).$promise.then(function (data) {
            self.action = data.toJSON();
            self.loadAudit();
        }, function (err) {
            Messaging.error(err);
        });
    };

    this.loadAudit = function () {
        self.action.parameters = ParameterService.unformat(self.action.parameters);
        if (self.action.actions) {
            self.action.actions.forEach(function (sub) {
                sub.parameters =   ParameterService.unformat(sub.parameters);
            });
        }

        CDSActionRsc.audit({ actionId: self.action.id }, function (data) {
            self.audit = data;
            if (self.audit && self.audit.length > 0) {
                self.audit.forEach(function (a) {
                    if (!self.action.requirements) {
                        self.action.requirements = [];
                    }
                    if (!self.action.parameters) {
                        self.action.parameters = [];
                    }

                    if (!a.action.requirements) {
                        a.action.requirements = [];
                    }
                    if (!a.action.parameters) {
                        a.action.parameters = [];
                    }
                    a.action.parameters = ParameterService.unformat(a.action.parameters);
                });
            }
        }, function (err) {
            Messaging.error(err);
        });
    };

    /**
     * @ngdoc function
     * @methodOf cdsApp.controller:ActionShowCtrl
     * @name saveAction
     * @description Call API to update the current action
     */
    this.saveAction = function (a) {
        // Cast action parameters in String
        if (a.parameters) {
            a.parameters = ParameterService.format(a.parameters);
        }

        // Cast sub action parameters in String
        if (a.actions) {
            a.actions.forEach(function (item, index) {
                if (item.parameters) {
                    a.actions[index].parameters = ParameterService.format(item.parameters);
                }
            });
        }

        return CDSActionRsc.update({ "actionName": $state.params.actionName }, a, function () {
            self.action = a;
            if ($state.params.actionName !== a.name) {
                $state.go("app.action-show", { "actionName": a.name, "tab": "action" }, { notify: false });

            }
            self.loadAudit();
        }, function (err) {
            Messaging.error(err);
            return $q.reject(err);
        }).$promise;
    };

    this.deleteAction = function () {
        return CDSActionRsc.delete({ actionName: self.action.name }, function () {
            $state.go("app.action-list");
        }, function (err) {
            Messaging.error(err);
            return $q.reject(err);
        }).$promise;
    };

    this.deletePlugin = function () {
        return CDSPluginRsc.delete({ pluginName: self.action.name }, function () {
            $state.go("app.action-list");
        }, function (err) {
            Messaging.error(err);
            return $q.reject(err);
        }).$promise;

    };

    this.goToPipelineAction = function (p) {
        if (!p.project_key && !p.pipeline_name) {
            $state.go("app.action-show", { "actionName": p.action_name, "tab": "action" });
        } else if (p.pipeline_name && p.key && p.stage_id) {
            $state.go("app.pipeline-action-show", {
                key: p.key,
                pipName: p.pipeline_name,
                stageId: p.stage_id,
                actionId: p.action_id,
                tab: "action",
                edit: true
            });
        }
    };

    this.updateUrl = function (tab) {
        $state.go("app.action-show", { actionName: $state.params.actionName, tab: tab }, { notify: false, reload: false });
    };

    this.init = function () {
        self.loadAction();
        Auth.isAdmin().then(function (isAdmin) {
            self.admin = isAdmin;
            $rootScope.$broadcast("hideEditMode", !isAdmin);

            if (self.admin) {
                CDSActionRsc.pipelines({ actionName: $state.params.actionName }, function (data) {
                    self.pipelines = data;
                }, function () {
                });
            }
        });

        self.tab = $state.params.tab;

    };
    this.init();

    $scope.$on("editModeStateEvent", function (event, args) {
        self.edit = args;
    });
});
