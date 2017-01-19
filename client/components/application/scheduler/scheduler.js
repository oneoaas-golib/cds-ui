"use strict";

angular.module("cdsApp").component("schedulers", {
    bindings: {
        application: "="
    },
    controllerAs: "ctrl",
    controller: function ($q, $state, Project, CDSApplicationPipelinesRsc, Messaging, ParameterService, Application) {
        var self = this;
        this.newScheduler = {
            environment_name: "",
            args: [],
            crontab: "0 * * * *",
            disable: false
        };
        this.environments = [];
        this.selected = {};

        this.schedulerPopover = {
            templateUrl: "components/application/scheduler/template/schedulerPopoverTemplate.html",
            openedKey: "",
            open: function open (v) {
                _.keys(self.application.schedulers).forEach(function (item) {
                    self.application.schedulers[item].forEach(function (s) {
                        s.popover = false;
                    });
                });
                v.popover = true;
            },
            close: function close (v) {
                v.popover = false;
            }
        };

        this.selectPipeline = function (item) {
            var appPipeline = _.find(self.application.pipelines, function (appPip) {
                return appPip.pipeline.name === item.pipeline.name;
            });
            if (appPipeline) {
                self.newScheduler.args = _.cloneDeep(appPipeline.pipeline.parameters);
            }
        };

        this.hasScheduler = function () {
            return Object.keys(self.application.schedulers).length > 0;
        };

        this.selectEnv = function (item) {
            self.newScheduler.environment_name = item.name;
        };

        this.canAdd = function () {
            if (!self.selected.pipeline || (self.selected.pipeline && self.selected.pipeline.type !== "build" && self.newScheduler.environment_name === "")) {
                return false;
            }
            return true;
        };

        this.updateScheduler = function (s, pipName) {
            if (s.args) {
                s.args = ParameterService.format(s.args);
            }
            return CDSApplicationPipelinesRsc.updateScheduler({ "key": $state.params.key, "appName": self.application.name, "pipName": pipName }, s,
                function () {
                    Application.invalidApplication($state.params.key, $state.params.appName);
                    return Application.getApplication($state.params.key, $state.params.appName).then(function (app) {
                        self.application = app;
                        self.reloadScheduler();
                    });
                }, function (err) {
                    Messaging.error(err);
                    return $q.reject(err);
                });
        };

        this.deleteScheduler = function (s, pipName) {
            return CDSApplicationPipelinesRsc.deleteScheduler({ "key": $state.params.key, "appName": self.application.name, "pipName": pipName, id: s.id },
                function () {
                    Application.invalidApplication($state.params.key, $state.params.appName);
                    return Application.getApplication($state.params.key, $state.params.appName).then(function (app) {
                        self.application = app;
                        self.reloadScheduler();
                    });
                }, function (err) {
                    Messaging.error(err);
                    return $q.reject(err);
                });
        };

        this.createScheduler = function () {
            if (self.newScheduler.args) {
                self.newScheduler.args = ParameterService.format(self.newScheduler.args);
            }
            return CDSApplicationPipelinesRsc.addScheduler(
                { "key": $state.params.key, "appName": self.application.name, "pipName": self.selected.pipeline.name }, self.newScheduler,
                function () {
                    Application.invalidApplication($state.params.key, $state.params.appName);
                    return Application.getApplication($state.params.key, $state.params.appName).then(function (app) {
                        self.application = app;
                        self.reloadScheduler();
                    });
                },
                function (err) {
                    Messaging.error(err);
                    return $q.reject(err);
                });
        };

        this.reloadScheduler = function () {
            if (self.application.pipelines) {
                self.application.pipelines.forEach(function (p) {
                    CDSApplicationPipelinesRsc.schedulers({
                        "key": $state.params.key,
                        "appName": $state.params.appName,
                        "pipName": p.pipeline.name
                    }, function (schedulers) {
                        if (schedulers.length > 0) {
                            if (!self.application.schedulers) {
                                self.application.schedulers = {};
                            }
                            if (!self.application.schedulers[p.pipeline.name]) {
                                self.application.schedulers[p.pipeline.name] = [];
                            }
                            self.application.schedulers[p.pipeline.name] = schedulers;
                        }
                    }, function (err) {
                        Messaging.error(err);
                    });
                });
            }
        };

        this.init = function () {
            Project.getProject($state.params.key).then(function (data) {
                self.environments = data.environments;
            });
        };
        this.init();

    },
    templateUrl: "components/application/scheduler/scheduler.html"
});
