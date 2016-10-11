"use strict";

/**
 * @ngdoc controller
 * @name cdsApp.controller:ApplicationShowCtrl
 * @requires $httpParamSerializer, $rootScope, $state, $scope, $translate, $timeout, Project, APPLICATION_CST, CDSHookRsc, ParameterService, Messaging,  Application, Permission, EditMode, CDSApplicationRsc, CDSApplicationHistoryRsc, CDSApplicationTreeRsc, CDSApplicationGroupsRsc, CDSApplicationPipelinesRsc, CDSApplicationVarRsc, CDSApplicationPipelineHistoryRsc, CDSSuggestVariableRsc, CDSRepoManagerRsc, jsPlumbService
 *
 * @description Manage show application view
 *
 */
angular.module("cdsApp").controller("ApplicationShowCtrl", function ApplicationShowCtrl ($q, $localStorage, $httpParamSerializer, $rootScope, $state, $scope, $translate, $timeout,
                                                                                         Project, APPLICATION_CST, CDSHookRsc, ParameterService, Messaging, Application, Permission, EditMode,
                                                                                         CDSApplicationRsc, CDSApplicationHistoryRsc, CDSApplicationTreeRsc, CDSApplicationGroupsRsc, CDSApplicationPipelinesRsc, CDSApplicationVarRsc, CDSApplicationPipelineHistoryRsc,
                                                                                         CDSSuggestVariableRsc, CDSRepoManagerRsc, VIEW_PREFIX, Warning,
                                                                                         jsPlumbService, Poller, Modal, CDSPollerRsc) {

    var self = this;

    this.canEditApplication = false;
    this.hookPlaceholder = APPLICATION_CST.HOOK_PLACEHOLDER;
    this.edit = EditMode.get();

    // Application to show
    this.source = {};

    // application data
    this.application = {};
    this.groups = [];

    // Workflow tree
    this.cdTree = [];
    this.additionnalApplication = [];

    // Build history
    this.applicationHistory = [];
    this.deployHistory = [];

    this.pipelines = [];
    this.project = {};
    this.key = $state.params.key;
    this.appName = $state.params.appName;
    this.choosenBranch = {
        display_id: "master"
    };
    this.choosenVersion = 0;
    this.branches = [];
    this.suggest = [];
    this.tab = {};
    this.hooks = [];
    this.hookType = [
        { name: $translate.instant("application_show_label_hook_repo"), value: APPLICATION_CST.HOOK_TYPE_REPO },
        { name: $translate.instant("application_show_label_hook_external"), value: APPLICATION_CST.HOOK_TYPE_EXTERNAL }
    ];
    this.hookExternal = APPLICATION_CST.HOOK_TYPE_EXTERNAL;
    this.audits = [];
    this.auditsChanges = false;
    this.selected = {
        pipeline: {},
        hook : {},
        hookType : {},
        poller: {},
        repoManager: {},
        repoFullName: ""
    };

    this.noRepoManager = false;
    this.tempPbResult = [];

    this.patternHookPrevalue = new RegExp("^[a-zA-Z0-9-.-_]{1,}\/[a-zA-Z0-9-.-_]{1,}\/[a-zA-Z0-9-.-_]{1,}$");

    this.jsplumbInstance = undefined;
    this.jsPlumbIds = [];
    this.jsPlumbOrientation = $localStorage[VIEW_PREFIX + "-" + $state.params.key + "-" + $state.params.appName];
    this.nbItemByLevel = [];
    this.viewsMode = ["vertical", "horizontal"];

    this.projectRepoManagers = [];

    this.loader = {
        jsplumb: true
    };

    this.changeView = function () {
        $localStorage[VIEW_PREFIX + "-" + $state.params.key + "-" + $state.params.appName] = self.jsPlumbOrientation;
        $state.go("app.application-show", { "key": $state.params.key, "appName": self.application.name, "tab": "workflow" }, { reload: true });
    };

    /**
     * @ngdoc function
     * @methodOf cdsApp.controller:ApplicationShowCtrl
     * @name rename
     * @description Rename the application
     */
    this.rename = function () {
        if (!Application.existInCache(self.key, self.appName)) {
            var modal = Modal.confirm.forceUpdate($translate.instant("common_application"));
            return modal.then(function () {
                return self.updateApplication();
            }, function () {
                return $q.reject("Cancel");
            });
        } else {
            return self.updateApplication();
        }
    };

    this.updateApplication = function () {
        var appUpdated = {
            name : self.application.name
        };
        return Application.update($state.params.key, $state.params.appName, appUpdated).then(function () {
            $state.go("app.application-show", { "key": $state.params.key, "appName": self.application.name, "tab": "advanced" }, { notify: false });
            Project.invalidProject($state.params.key);
            Application.invalidApplication($state.params.key, $state.params.appName);
            return Application.getApplication($state.params.key, self.application.name).then(function (app) {
                self.application = app;
            });
        }).$promise;
    };

    /**
     * @ngdoc function
     * @methodOf cdsApp.controller:ApplicationShowCtrl
     * @name canWrite
     * @description Test if the current user can write
     */
    this.canWrite = function () {
        self.canEditApplication = Permission.canWrite(self.application.permission);
        $rootScope.$broadcast("hideEditMode", !self.canEditApplication);
    };

    /**
     * @ngdoc function
     * @methodOf cdsApp.controller:ApplicationShowCtrl
     * @name attachPipeline
     * @description Attach pipeline to application
     */
    this.attachPipeline = function () {
        return CDSApplicationPipelinesRsc.save({
            "key": $state.params.key,
            "appName": $state.params.appName,
            "pipName": self.selected.pipeline.name
        }, self.selected.pipeline, function () {
            Application.invalidApplication($state.params.key, $state.params.appName);
            Project.invalidProject($state.params.key);
            $state.go("app.application-show", {
                "key": $state.params.key,
                "appName": $state.params.appName
            }, { "reload": true });
        }, function (err) {
            Messaging.error(err);
            return $q.reject(err);
        }).$promise;
    };

    /**
     * @ngdoc function
     * @methodOf cdsApp.controller:ApplicationShowCtrl
     * @name saveParams
     * @description Call api to save application pipeline parameters
     */
    this.saveParams = function () {
        if (!Application.existInCache(self.key, self.appName)) {
            var modal = Modal.confirm.forceUpdate($translate.instant("common_application"));
            return modal.then(function () {
                return self.saveApplicationPipelineParameters();
            }, function () {
                return $q.reject("Cancel");
            });
        } else {
            return self.saveApplicationPipelineParameters();
        }
    };

    this.saveApplicationPipelineParameters = function () {
        return CDSApplicationPipelinesRsc.update({
            "key": $state.params.key,
            "appName": $state.params.appName
        }, self.application.pipelines, function () {
            Application.invalidApplication($state.params.key, $state.params.appName);
            return Application.getApplication($state.params.key, $state.params.appName).then(function (app) {
                self.application = app;
            });
        }, function (err) {
            Messaging.error(err);
            return $q.reject(err);
        }).$promise;
    };

    this.updatePoller = function (p) {
        if (self.edit) {
            var request = angular.copy(p);
            request.enabled = !request.enabled;
            CDSPollerRsc.update({ "key": $state.params.key, "appName": $state.params.appName, "pipName": p.pipeline.name }, request, function () {
                Messaging.success($translate.instant("application_show_poller_msg_updated"));
                p.enabled = !p.enabled;
            }, function (err) {
                Messaging.error(err);
            });
        }
    };

    this.updateHook = function (h) {
        if (self.edit) {
            var request = angular.copy(h);
            request.enabled = !request.enabled;
            CDSHookRsc.update({ "key": $state.params.key, "appName": $state.params.appName, "pipName": h.pipeline.name, "hookId": h.id }, request, function () {
                Messaging.success($translate.instant("application_show_hook_msg_updated"));
                h.enabled = !h.enabled;
            }, function (err) {
                Messaging.error(err);
            });
        }
    };

    this.deletePoller = function (p, index) {
        return CDSPollerRsc.delete({ "key": $state.params.key, "appName": $state.params.appName, "pipName": p.pipeline.name }, function () {
            Messaging.success($translate.instant("application_show_poller_msg_deleted"));
            self.pollers.splice(index, 1);
        }, function (err) {
            Messaging.error(err);
            return $q.reject(err);
        }).$promise;
    };

    this.deleteHook = function (h, index) {
        // FIXME : refactoring when api will have only one handler CD-1373
        if (h.host.indexOf("https") === -1) {
            return CDSHookRsc.delete({ "key": $state.params.key, "appName": $state.params.appName, "pipName": h.pipeline.name, "hookId": h.id }, function () {
                Messaging.success($translate.instant("application_show_hook_msg_deleted"));
                self.hooks.splice(index, 1);
            }, function (err) {
                Messaging.error(err);
                return $q.reject(err);
            }).$promise;
        } else {
            console.log("Sorry, please use CLI:   cds pipeline hook delete " + $state.params.key + " " + $state.params.appName + " " + h.pipeline.name);
            Messaging.error("Sorry, please use CLI:   cds pipeline hook delete " + $state.params.key + " " + $state.params.appName + " " + h.pipeline.name);
            return $q.reject("Not Implemented");
        }
    };

    this.submitAddPoller = function (form) {
        self.submitted = true;
        if (form.$valid) {
            return CDSPollerRsc.create({ "key": $state.params.key, "appName": $state.params.appName, "pipName":  self.selected.poller.pipeline.name },
                { name: self.application.repositories_manager.name },
                function (data) {
                    if (!self.pollers) {
                        self.pollers = [];
                    }
                    self.pollers.push(data);
                }, function (err) {
                    Messaging.error(err);
                    return $q.reject(err);
                });
        }
    };

    this.submitAddHook = function (form) {
        self.submitted = true;
        if (form.$valid) {
            if (self.selected.hookType.value === APPLICATION_CST.HOOK_TYPE_REPO && self.application.repositories_manager && self.application.repository_fullname && self.application.repository_fullname !== "") {
                return CDSHookRsc.createWithRepo({ "key": $state.params.key, "appName": $state.params.appName, "repoManName": self.application.repositories_manager.name },
                    { "repository_fullname": self.application.repository_fullname, "pipeline_name": self.selected.hook.pipeline.name },
                    function (data) {
                        self.hooks.push(angular.copy(data));
                        self.selected.hook = {};
                        self.submitted = false;
                    }, function (err) {
                        Messaging.error(err);
                        return $q.reject(err);
                    }).$promise;
            } else if (self.selected.hookType.value === APPLICATION_CST.HOOK_TYPE_EXTERNAL) {
                // add hook
                var prevalueSplitted = self.selected.hook.prevalue.split("/");
                self.selected.hook.host = prevalueSplitted[0];
                self.selected.hook.project = prevalueSplitted[1];
                self.selected.hook.repository = prevalueSplitted[2];
                self.selected.hook.application_id = self.application.id;
                self.selected.hook.kind = "stash";
                return CDSHookRsc.create({ "key": $state.params.key, "appName": $state.params.appName, "pipName": self.selected.hook.pipeline.name }, self.selected.hook, function (data) {
                    Messaging.success($translate.instant("application_show_hook_msg_created"));
                    self.submitted = false;
                    self.hooks.push(angular.copy(data));
                    self.selected.hook = {};
                }, function (err) {
                    Messaging.error(err);
                    return $q.reject(err);
                }).$promise;
            }
        }
        return $q.reject("Wrong Form");
    };

    /**
     * @ngdoc function
     * @methodOf cdsApp.controller:ApplicationShowCtrl
     * @name saveVariables
     * @description Call api to save application variables
     */
    this.saveVariables = function () {
        self.application.variables = ParameterService.format(self.application.variables);
        if (!Application.existInCache(self.key, self.appName)) {
            var modal = Modal.confirm.forceUpdate($translate.instant("common_application"));
            return modal.then(function () {
                return self.saveApplicationVariables();
            }, function () {
                return $q.reject("Cancel");
            });
        } else {
            return self.saveApplicationVariables();
        }
    };

    this.saveApplicationVariables = function () {
        return CDSApplicationVarRsc.update({
            "key": $state.params.key,
            "appName": $state.params.appName
        }, self.application.variables, function () {
            Application.invalidApplication($state.params.key, $state.params.appName);
            self.loadAudit();
            return Application.getApplication($state.params.key, $state.params.appName).then(function (app) {
                self.application = app;
            });
        }, function (err) {
            Messaging.error(err);
            return $q.reject(err);
        }).$promise;
    };

    /**
     * @ngdoc function
     * @methodOf cdsApp.controller:ApplicationShowCtrl
     * @name saveGroups
     * @description Call api to save application groups
     */
    this.saveGroups = function () {
        if (!Application.existInCache(self.key, self.appName)) {
            var modal = Modal.confirm.forceUpdate($translate.instant("common_application"));
            return modal.then(function () {
                return self.updateApplicationPermission();
            }, function () {
                return $q.reject("Cancel");
            });
        } else {
            return self.updateApplicationPermission();
        }
    };

    this.updateApplicationPermission = function () {
        return CDSApplicationGroupsRsc.update({
            "key": $state.params.key,
            "appName": $state.params.appName
        }, self.groups, function () {
            self.application.groups = angular.copy(self.groups);
            Application.invalidApplication($state.params.key, $state.params.appName);
            return Application.getApplication($state.params.key, $state.params.appName).then(function (app) {
                self.application = app;
            });
        }, function (err) {
            Messaging.error(err);
            self.groups = angular.copy(self.application.groups);
            return $q.reject(err);
        }).$promise;
    };

    this.loadBranchHistory = function () {
        CDSApplicationPipelineHistoryRsc.branchHistory({
            "key": $state.params.key,
            "appName": $state.params.appName,
            "page" : 1,
            "perPage" : 20
        }, function (data) {
            self.branchHistory = [];
            if (data) {
                data.forEach(function (b) {
                    var branchData = _.find(self.branchHistory, { branch: b.trigger.vcs_branch });
                    if (!branchData) {
                        branchData = {
                            branch: b.trigger.vcs_branch,
                            builds: []
                        };
                        self.branchHistory.push(branchData);
                    }
                    branchData.builds.push(b);
                });
            }
        }, function (err) {
            Messaging.error(err);
        });
    };

    /**
     * @ngdoc function
     * @methodOf cdsApp.controller:ApplicationShowCtrl
     * @name loadApplication
     * @description Load the given application
     */
    this.loadApplication = function () {
        self.refreshStatus(true);

        if (self.cdTree.length === 0) {
            self.loadTree();
        }
    };

    this.loadTree = function () {
        CDSApplicationTreeRsc.query({ "key": $state.params.key, "appName": $state.params.appName }, function (data) {
            self.additionnalApplication = [];
            self.initTree(data);
            self.treeLoaded = true;
            updateCDTree(self.application);
            self.refreshJSPlumb();
        }, function (err) {
            Messaging.error(err);
        });
    };

    function resetCDTree () {
        if (self.cdTree.length > 0) {
            self.cdTree.forEach(function (item) {
                resetCDTreeItem(item);
            });
        }
    }

    function updateCDTree (application) {
        if (self.cdTree.length > 0) {
            self.cdTree.forEach(function (item) {
                updateCDTreeItem(item, application);
            });
        }
    }

    function resetCDTreeItem (item) {
        item.pipeline.last_pipeline_build = {};
        if (item.subPipelines) {
            item.subPipelines.forEach(function (s) {
                resetCDTreeItem(s);
            });
        }
    }

    function updateCDTreeItem (item, application) {
        if (item.application.id === application.id) {
            var pipelineBuildUpdated = _.find(application.pipelines_build, { pipeline : { id: item.pipeline.id }, environment: { id: item.environment.id } });
            if (pipelineBuildUpdated) {
                item.pipeline.last_pipeline_build = pipelineBuildUpdated;
            } else {
                // check if it's a deployment/testing pipeline
                if (item.pipeline.type === "deployment" || item.pipeline.type === "testing") {
                    if (item.environment.name === "NoEnv") {
                        // Root Item = pipeline that need an env but there is no one.
                        if (self.project.environments) {
                            // browse project environment
                            self.project.environments.forEach(function (e, i) {
                                // for each;  1st erase item, 2nd and after add new Item in CDTREE
                                var lastPB =  _.find(application.pipelines_build, { pipeline : { id: item.pipeline.id }, environment: { id: e.id } });
                                if (i === 0) {
                                    item.environment = e;
                                    item.pipeline.last_pipeline_build = lastPB;
                                } else {
                                    var newItem = angular.copy(item);
                                    newItem.environment = e;
                                    newItem.pipeline.last_pipeline_build = lastPB;
                                    self.cdTree.push(newItem);
                                }
                            });
                        }
                    }
                }
            }

            // update parent information
            if (item.parent && item.parent.pipelineID && item.parent.environmentID) {
                var parentUpdated = _.find(application.pipelines_build, { pipeline : { id: item.parent.pipelineID }, environment: { id: item.parent.environmentID } });

                if (parentUpdated) {
                    item.parent.buildNumber = parentUpdated.build_number;
                    item.parent.version = parentUpdated.version;
                    if (parentUpdated.trigger) {
                        item.parent.branch = parentUpdated.trigger.vcs_branch;
                    }
                }
            }

            // get parameters
            var pipelineUpdated = _.find(application.pipelines, { pipeline : { id: item.pipeline.id } });
            if (pipelineUpdated) {
                item.pipeline.parameters = Application.mergeParams(pipelineUpdated.parameters, pipelineUpdated.pipeline.parameters);
            }
        }
        if (item.subPipelines) {
            item.subPipelines.forEach(function (s) {
                updateCDTreeItem(s, application);
            });
        }
    }

    this.initTree = function (data) {
        if (data.length > 0) {
            // browse all item to configure ID and jsplumb link between them
            data.forEach(function (item, index) {

                self.nbItemByLevel[0] = data.length;
                item.id = index;
                configureItemForJSPlumb(item, index);
                self.checkMultiApp(item);
            });
        }
        self.cdTree = data;

        // Init Orientation
        var max = 0;
        self.nbItemByLevel.forEach(function (item) {
            max = item > max ? item : max;
        });
        if (!self.jsPlumbOrientation || self.jsPlumbOrientation === "") {
            if (max > 5) {
                self.jsPlumbOrientation = "horizontal";
            } else {
                self.jsPlumbOrientation = "vertical";
            }
        }
    };

    this.loadProject = function () {
        Project.getProject($state.params.key).then(function (data) {
            self.project = data;
            $rootScope.$broadcast("select-application", { project: data, application: { name: $state.params.appName } });
        });
    };

    /**
     * @ngdoc function
     * @methodOf cdsApp.controller:ApplicationShowCtrl
     * @name loadApplicationPipelinesAndHistory
     * @description Load all application pipelines
     */
    this.loadApplicationHistory = function () {
        CDSApplicationHistoryRsc.query({ "key": $state.params.key, "appName": $state.params.appName }, function (data) {
            self.applicationHistory = data;
        }, function (err) {
            Messaging.error(err);
        });
    };

    /**
     * @ngdoc function
     * @methodOf cdsApp.controller:ApplicationShowCtrl
     * @name loadParamSuggest
     * @description Load parameters suggestion
     */
    this.loadParamSuggest = function () {
        CDSSuggestVariableRsc.query({ "key": $state.params.key, "appName": $state.params.appName }, function (data) {
            self.suggest = data;
        });
    };

    /**
     * @ngdoc function
     * @methodOf cdsApp.controller:ApplicationShowCtrl
     * @name deleteApplication
     * @description Call API to delete the current application
     */
    this.deleteApplication = function () {
        return Application.delete($state.params.key, $state.params.appName).then(function () {
            Project.invalidProject($state.params.key);
            Application.invalidApplication($state.params.key, $state.params.appName);
            $state.go("app.project-show",  { "key": $state.params.key });
        }).$promise;
    };

    this.checkMultiApp = function (item) {
        if (item.application.name !== self.appName && self.additionnalApplication.indexOf(item.application.name) === -1) {
            self.additionnalApplication.push(item.application.name);
            CDSApplicationRsc.poll($scope, { "key": $state.params.key, "appName": item.application.name, "applicationStatus": true, "branchName": self.choosenBranch.display_id, "version": self.choosenVersion }).then(updateCDTree, function (err) {
                if (err && err.status) {
                    Messaging.error(err);
                }
            }, updateCDTree);
        }

        if (item.subPipelines !== null) {
            item.subPipelines.forEach(function (elt) {
                self.checkMultiApp(elt);
            });
        }
    };

    /**
     * @ngdoc function
     * @name configureItemForJSPlumb
     * @description Configure an Item. Set ID, parent information + link with child
     */
    function configureItemForJSPlumb (item, deep) {

        // If there are children...
        if (item.subPipelines !== null) {

            if (!self.nbItemByLevel[deep + 1]) {
                self.nbItemByLevel[deep + 1] = 0;
            }
            self.nbItemByLevel[deep + 1] += item.subPipelines.length;

            for (var i = 0; i < item.subPipelines.length; i++) {
                item.subPipelines[i].parentId = item.id;

                // Build parent information for the current child
                item.subPipelines[i].parent = {
                    pipelineID: item.pipeline.id,
                    pipelineName: item.pipeline.name,
                    applicationName: item.application.name,
                    applicationID: item.application.id,
                    environmentID: item.environment.id,
                };

                item.subPipelines[i].id = item.id + "N" + i;

                // Configure the current child
                configureItemForJSPlumb(item.subPipelines[i], deep + 1);
            }
        }
        initTopEndpoint(item);
        initBottomEndpoint(item);
    }

    function initTopEndpoint (item) {
        var endPoint = {
            id: "T" + item.id,
            enable: false,
            isSource: true
        };
        item.top = endPoint;
        self.jsPlumbIds.push(endPoint.id);
    }

    function initBottomEndpoint (item) {
        var endpoint = {
            id: "B" + item.id,
            enable: false,
            isTarget: true
        };

        if (item.subPipelines !== null && item.subPipelines !== undefined) {
            var connections = [];
            for (var i = 0; i < item.subPipelines.length; i++) {
                var connection = item.subPipelines[i].id;
                connections.push("T" + connection);
            }
            endpoint.connections = connections;
        }
        item.bottom = endpoint;
        self.jsPlumbIds.push(endpoint.id);
    }

    this.instanceOptions = {
        MaxConnections: -1    // unlimited number of connections,
    };

    this.loadAudit = function () {
        CDSApplicationRsc.audit({ key: $state.params.key, appName: $state.params.appName }, function (data) {
            self.audits = data;
            self.initSelectAudit();
        }, function (err) {
            Messaging.error(err);
        });
    };

    $scope.$on("jsplumb.instance.created", function (evt, instance) {
        self.jsplumbInstance = instance;
        instance.Defaults.Container = $("body");
        $timeout(function () {
            self.jsplumbInstance.repaintEverything();
        });
    });

    /**
     * @ngdoc function
     * @methodOf cdsApp.controller:ApplicationShowCtrl
     * @name selectTab
     * @description Select tab
     */
    this.selectTab = function (tab) {
        self.loadProject();
        $rootScope.$broadcast("stop-application-poller");

        switch (tab) {
            case "workflow":
                self.cdTree = [];
                self.tab.active = 0;
                self.loadApplication();
                break;
            case "version":
                Application.getApplication($state.params.key, $state.params.appName).then(function (data) {
                    self.application = data;
                    self.canWrite();
                    CDSApplicationPipelineHistoryRsc.deployHistory({
                        "key": $state.params.key,
                        "appName": $state.params.appName
                    }, function (data) {
                        if (data) {
                            self.deployHistory = [];
                            data.forEach(function (pb) {
                                var currentEnv = _.find(self.deployHistory, { "envName": pb.environment.name });
                                if (!currentEnv) {
                                    currentEnv = {
                                        envName: pb.environment.name,
                                        pipelineBuild: []
                                    };
                                    self.deployHistory.push(currentEnv);
                                }
                                currentEnv.pipelineBuild.push(pb);
                            });
                        }
                    }, function (err) {
                        Messaging.error(err);
                    });
                    self.loadBranchHistory();
                });
                self.tab.active = 6;
                break;
            case "history":
                Application.getApplication($state.params.key, $state.params.appName).then(function (data) {
                    self.application = data;
                    self.canWrite();
                    self.loadApplicationHistory();
                });
                self.tab.active = 1;
                break;
            case "pipeline":
                Application.getApplication($state.params.key, $state.params.appName).then(function (data) {
                    self.application = data;
                    self.canWrite();
                    if (data.pipelines) {
                        data.pipelines.forEach(function (d) {
                            d.parameters = Application.mergeParams(d.parameters, d.pipeline.parameters);
                            self.pipelines.push(d.pipeline);
                        });
                        if (data.pipelines.length > 0) {
                            self.selected.hook.pipeline = data.pipelines[0].pipeline;
                        }
                    }
                    self.loadParamSuggest();
                });
                self.tab.active = 2;
                break;
            case "parameter":
                Application.getApplication($state.params.key, $state.params.appName).then(function (data) {
                    self.application = data;
                    self.loadAudit();
                    self.canWrite();
                    self.loadParamSuggest();
                });
                self.tab.active = 3;
                break;
            case "group":
                Application.getApplication($state.params.key, $state.params.appName).then(function (data) {
                    self.application = data;
                    self.groups = angular.copy(data.groups);
                    self.canWrite();
                });
                self.tab.active = 4;
                break;
            case "notification":
                Application.getApplication($state.params.key, $state.params.appName).then(function (data) {
                    self.application = data;
                    self.loadParamSuggest();
                    self.canWrite();
                });
                self.tab.active = 7;
                break;
            case "advanced":
                Application.getApplication($state.params.key, $state.params.appName).then(function (data) {
                    self.application = data;
                    if (data.pipelines) {
                        data.pipelines.forEach(function (d) {
                            d.parameters = Application.mergeParams(d.parameters, d.pipeline.parameters);
                            self.pipelines.push(d.pipeline);
                        });
                        if (data.pipelines.length > 0) {
                            self.selected.hook.pipeline = data.pipelines[0].pipeline;
                        }
                    }
                    self.canWrite();
                    self.loadHooks();
                    self.loadPollers();
                    self.loadProjectRepoManager();
                });
                self.tab.active = 5;
                break;
        }
        $state.go("app.application-show", {
            "key": $state.params.key,
            "appName": $state.params.appName,
            "tab": tab
        }, { notify: false, reload: false });
    };

    this.refreshJSPlumb = function () {
        if (self.jsplumbInstance) {
            self.jsPlumbIds.forEach(function (id) {
                self.jsplumbInstance.hide(id);
            });
            $timeout(function () {
                self.jsplumbInstance.repaintEverything();
                self.jsPlumbIds.forEach(function (id) {
                    self.jsplumbInstance.show(id);
                });
            }, 1000);

        }
    };

    /**
     * @ngdoc function
     * @methodOf cdsApp.controller:ApplicationShowCtrl
     * @name loadHooks
     * @description Load hooks for the current application
     */
    this.loadHooks = function () {
        CDSHookRsc.query({ "key": $state.params.key, "appName": $state.params.appName }, function (data) {
            self.hooks = data;
        }, function (err) {
            Messaging.error(err);
        });
    };

    /**
     * @ngdoc function
     * @methodOf cdsApp.controller:ApplicationShowCtrl
     * @name loadPollers
     * @description Load pollers for the current application
     */
    this.loadPollers = function () {
        CDSPollerRsc.query({ "key": $state.params.key, "appName": $state.params.appName }, function (data) {
            self.pollers = data;
        }, function (err) {
            Messaging.error(err);
        });
    };

    /**
     * @ngdoc function
     * @methodOf cdsApp.controller:ApplicationShowCtrl
     * @name loadProjectRepoManager
     * @description Load RepoManagers link to the project
     */
    this.loadProjectRepoManager = function () {
        CDSRepoManagerRsc.getByProject({ "key": $state.params.key }, function (data) {
            self.projectRepoManagers = data;
            if (data && data.length > 0) {
                self.selected.repoManager = data[0];
                self.loadRepoFromRepoManager();
            } else {
                self.noRepoManager = true;
            }
        }, function (err) {
            Messaging.error(err);
        });
    };

    this.getProjectAdvancedURL = function () {
        return "#/project/" + self.key + "?tab=advanced";
    };

    /**
     * @ngdoc function
     * @methodOf cdsApp.controller:ApplicationShowCtrl
     * @name refreshListRepo
     * @description Refresh the list of available repository
     */
    this.refreshListRepo = function ($select) {
        if ($select.search && $select.search !== "") {
            self.listReposTemp = [];
            if (self.listRepos) {
                self.listRepos.forEach(function (repo) {
                    if (repo.fullname.toLowerCase().indexOf($select.search.toLowerCase()) !== -1 || repo.url.toLowerCase().indexOf($select.search.toLowerCase()) !== -1) {
                        self.listReposTemp.push(repo);
                    }
                });
            }
        }
    };

    /**
     * @ngdoc function
     * @methodOf cdsApp.controller:ApplicationShowCtrl
     * @name addApplicationRepo
     * @description Call API to link application to repository
     */
    this.addApplicationRepo = function () {
        if (!Application.existInCache(self.key, self.appName)) {
            var modal = Modal.confirm.forceUpdate($translate.instant("common_application"));
            return modal.then(function () {
                return self.linkRepoToApplication();
            }, function () {
                return $q.reject("Cancel");
            });
        } else {
            return self.linkRepoToApplication();
        }
    };

    this.linkRepoToApplication = function () {
        return CDSRepoManagerRsc.attachRepo({ "key": $state.params.key, "repoManName": self.selected.repoManager.name, "appName": $state.params.appName },
            $httpParamSerializer({ fullname: self.selected.repoFullName }), function () {
                Messaging.success($translate.instant("application_show_msg_repo_linked"));
                self.application.repositories_manager = angular.copy(self.selected.repoManager);
                self.application.repository_fullname = angular.copy(self.selected.repoFullName);
                Application.invalidApplication($state.params.key, $state.params.appName);
                return Application.getApplication($state.params.key, $state.params.appName).then(function (app) {
                    self.application = app;
                });
            }, function (err) {
                Messaging.error(err);
                return $q.reject(err);
            }).$promise;
    };

    /**
     * @ngdoc function
     * @methodOf cdsApp.controller:ApplicationShowCtrl
     * @name addApplicationRepo
     * @description Call API to detach repository and application
     */
    this.detachRepoFromApplication = function () {
        return CDSRepoManagerRsc.detachRepo({ "key": $state.params.key, "repoManName": self.selected.repoManager.name, "appName": $state.params.appName },
            {}, function () {
                Application.invalidApplication($state.params.key, $state.params.appName);
                delete self.application.repositories_manager;
                self.application.repository_fullname = "";
                self.loadHooks();
                return Application.getApplication($state.params.key, $state.params.appName).then(function (app) {
                    self.application = app;
                });
            }, function (err) {
                Messaging.error(err);
                return $q.reject(err);
            }).$promise;
    };

    /**
     * @ngdoc function
     * @methodOf cdsApp.controller:ApplicationShowCtrl
     * @name loadRepoFromRepoManager
     * @description Call API to load all repositories from repository manager
     */
    this.loadRepoFromRepoManager = function () {
        self.loadingRepos = true;
        CDSRepoManagerRsc.repos({ "key": $state.params.key, "repoManName" : self.selected.repoManager.name }, function (data) {
            self.loadingRepos = false;
            self.listRepos = data;
            self.listReposTemp = [];
        }, function (err) {
            self.loadingRepos = false;
            Messaging.error(err);
        });
    };

    this.listVersions = function () {
        CDSApplicationRsc.versions({ "key": $state.params.key, "appName": $state.params.appName, "branch": self.choosenBranch.display_id }, function (data) {
            self.versions = data;
            self.versions.unshift("");
            self.choosenVersion = data[0];
        }, function (err) {
            Messaging.error(err);
        });

    };

    this.refreshStatus = function (version) {
        $state.go("app.application-show", { key: $state.params.key, appName: $state.params.appName, branch: self.choosenBranch.display_id }, { notify: false, reload: false });

        Poller.kill({
            scope: $scope.$id
        });
        resetCDTree();
        if (version) {
            self.choosenVersion = 0;
            self.listVersions();
        }

        CDSApplicationRsc.poll($scope, { "key": $state.params.key, "appName": $state.params.appName, "applicationStatus": true, "branchName": self.choosenBranch.display_id, "version": self.choosenVersion }).then("", function (err) {
            if (err && err.status) {
                Messaging.error(err);
            }
        }, function (data) {
            self.application = data;
            self.canWrite();
            updateCDTree(data);
        });

        self.additionnalApplication = [];
        self.cdTree.forEach(function (item) {
            self.checkMultiApp(item);
        });
    };

    this.listBranches = function () {
        CDSApplicationRsc.branches({ "key": $state.params.key, "appName": $state.params.appName }, function (data) {
            self.branches = [];
            self.branches.push({
                display_id: ""
            });

            data = _.sortBy(data, function (b) {
                return b.display_id;
            });

            self.branches = self.branches.concat(data.reverse());
            var found = false;
            if (data) {
                data.forEach(function (item) {
                    if (item.display_id === self.choosenBranch.display_id) {
                        self.choosenBranch = item;
                        found = true;
                    }
                });
            }
            if (!found) {
                self.choosenBranch = self.branches[0];
            }
        }, function (err) {
            Messaging.error(err);
        });
    };

    this.initSelectAudit = function () {
        this.auditSelect = [];

        this.auditSelect.push({ id: 0, value: $translate.instant("parameter_management_audit_current") });
        this.selectedAudit = self.auditSelect[0];
        if (self.audits) {
            self.audits.forEach(function (a) {
                self.auditSelect.push({
                    id: a.id,
                    value: moment(a.versionned).format("YYYY/MM/DD HH:mm:ss") + " (" + a.author + ")"
                });
            });
        }

    };

    this.restoreAudit = function () {
        return CDSApplicationRsc.restoreAudit({ key: $state.params.key, appName: $state.params.appName, auditId:  self.selectedAudit.id }, {}, function () {
            Application.invalidApplication($state.params.key, $state.params.appName);
            return Application.getApplication($state.params.key, $state.params.appName).then(function (app) {
                self.loadAudit();
                self.application = app;
            });
        }, function (err) {
            Messaging.error(err);
        });
    };

    this.updateSelectedAudit = function () {
        if (self.selectedAudit.id !== 0) {
            self.varsAudited = _.find(self.audits, { id: self.selectedAudit.id }).variables;
        }
    };

    this.init = function () {
        jsPlumbService.jsplumbInit().then(function () {
            self.loader.jsplumb = false;
            self.selected.hookType = self.hookType[0];
            if ($state.params.branch) {
                self.choosenBranch.display_id = $state.params.branch;
            }
            switch ($state.params.tab) {
                case "workflow":
                    self.tab.active = 0;
                    break;
                case "version":
                    self.tab.active = 6;
                    break;
                case "history":
                    self.tab.active = 1;
                    break;
                case "pipeline":
                    self.tab.active = 2;
                    break;
                case "parameter":
                    self.tab.active = 3;
                    break;
                case "group":
                    self.tab.active = 4;
                    break;
                case "advanced":
                    self.tab.active = 5;
                    break;
                case "notification":
                    self.tab.active = 7;
                    break;
            }
            self.listBranches();
        });
        self.applicationWarning = Warning.getApplicationInProjectWarning(self.key, self.appName);
        this.initSelectAudit();
    };

    $scope.$on("refresh-warning-data", function () {
        self.applicationWarning = Warning.getApplicationInProjectWarning(self.key, self.appName);
    });

    $scope.$on("refresh-application", function () {
        Application.getApplication($state.params.key, $state.params.appName).then(function (data) {
            self.application = data;
            self.canWrite();
        });
    });

    $scope.$on("sidebarStateChanged", function () {
        self.refreshJSPlumb();
    });

    $scope.$on("$destroy", function () {
    });

    this.init();

    $scope.$on("editModeStateEvent", function (event, args) {
        self.edit = args;
    });
});
