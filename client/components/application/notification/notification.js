"use strict";

angular.module("cdsApp").component("notificationManagement", {
    bindings: {
        application: "=",
        suggest: "=",
        edit: "@",
        key: "@"
    },
    controllerAs: "ctrl",
    controller: function ($scope, $sanitize, $q, $state, $translate, Project, CDSNotificationTypeRsc, Messaging, CDSApplicationPipelinesNotificationRsc, Application, Modal) {
        var self = this;

        this.environments = [];
        this.notifTypes = [];
        this.typeNotifAdded = "";
        this.selected = {
            notifs :  {}
        };

        this.notifPopover = {
            templateUrl: "components/application/notification/template/notifPopoverTemplate.html",
            openedKey: "",
            open: function open (notif) {
                self.application.notifications.forEach(function (n) {
                    _.keys(n.notifications).forEach(function (item) {
                        n.notifications[item].popover = false;
                    });
                });
                notif.popover = true;
            },
            close: function close (notif) {
                notif.popover = false;
            }
        };

        this.canAdd = function () {
            if (self.selected.pipeline && self.selected.pipeline.type !== "build" && !self.selected.environment) {
                return false;
            }
            return Object.keys(self.selected.notifs).length > 0;
        };

        this.addNotification = function () {
            if (this.selected.notifs[self.typeNotifAdded]) {
                return;
            }
            this.selected.notifs[self.typeNotifAdded] = {
                on_success: self.states[0],
                on_failure: self.states[0],
                on_start: false
            };
            switch (self.typeNotifAdded) {
                case "jabber":
                    this.selected.notifs[self.typeNotifAdded].send_to_groups = true;
                    this.selected.notifs[self.typeNotifAdded].send_to_author = true;
                    this.selected.notifs[self.typeNotifAdded].recipients = [];
                    this.selected.notifs[self.typeNotifAdded].template = {
                        "subject" : "{{.cds.project}}/{{.cds.application}} {{.cds.pipeline}} {{.cds.environment}}",
                        "body" : "Status : {{.cds.status}}\nBranch : {{.git.branch}}\nDetails : {{.cds.buildURL}}"
                    };
                    break;
                case "email":
                    this.selected.notifs[self.typeNotifAdded].send_to_groups = true;
                    this.selected.notifs[self.typeNotifAdded].send_to_author = true;
                    this.selected.notifs[self.typeNotifAdded].recipients = [];
                    this.selected.notifs[self.typeNotifAdded].template = {
                        subject : "{{.cds.project}}/{{.cds.application}} {{.cds.pipeline}} {{.cds.environment}}#{{.cds.version}} {{.cds.status}}",
                        body: " Project : {{.cds.project}} \nApplication : {{.cds.application}}\nPipeline : {{.cds.pipeline}}/{{.cds.environment}}#{{.cds.buildNumber}}\nStatuts : {{.cds.status}}\nDetails : {{.cds.buildURL}}\nTriggered by : {{.cds.triggered_by.username}}\nBranch : {{.git.branch}}"
                    };
                    break;
                case "tat":
                    this.selected.notifs[self.typeNotifAdded].topics = [];
                    this.selected.notifs[self.typeNotifAdded].template = {
                        "message" : "#project:{{.cds.project}} #application:{{.cds.application}} #pipeline:{{.cds.pipeline}} #environment:{{.cds.environment}} status#{{.cds.status}} {{.cds.buildURL}}"
                    };
                    break;
                default:
                    return;
            }

            _.remove(self.notifTypes, function (i) {
                return i === self.typeNotifAdded;
            });
            self.typeNotifAdded = self.notifTypes[0];
        };

        this.deleteNotification = function (n, value) {
            if (Object.keys(n.notifications).length === 1) {
                // delete notification
                var envName = "";
                if (n.environment) {
                    envName = n.environment.name;
                }

                if (!Application.existInCache(self.key, self.application.name)) {
                    n.notifications[value].popover = false;
                    var modal = Modal.confirm.forceUpdate($translate.instant("common_application"));
                    return modal.then(function () {
                        return self.deleteNotificationFromApplication(n, envName);
                    }, function () {
                        return $q.reject("Cancel");
                    });

                } else {
                    return self.deleteNotificationFromApplication(n, envName);
                }
            } else {
                // update notif
                var request = angular.copy(n);
                delete request.notifications[value];
                n.notifications[value].popover = false;
                return self.insertOrUpdateNotification(request);
            }
        };

        this.deleteNotificationFromApplication = function (n, envName) {
            return CDSApplicationPipelinesNotificationRsc.delete({
                key: $state.params.key,
                appName: $state.params.appName,
                pipName: n.pipeline.name,
                envName: envName
            }, {}, function () {
                _.remove(self.application.notifications, { application_pipeline_id: n.application_pipeline_id });
                Application.invalidApplication($state.params.key, $state.params.appName);
                return Application.getApplication($state.params.key, $state.params.appName).then(function (app) {
                    self.application = app;
                });
            }, function (err) {
                Messaging.error(err);
                return $q.reject(err);
            }).$promise;
        };

        this.removeFromAddedNotif = function (key) {
            delete self.selected.notifs[key];
            self.notifTypes.push(key);
            self.typeNotifAdded = self.notifTypes[0];
        };

        this.updateNotification = function (n, key, value) {
            var request = angular.copy(n);
            request.notifications[key] = value;
            return self.insertOrUpdateNotification(request);
        };

        this.insertOrUpdateNotification = function (request) {
            if (!Application.existInCache(self.key, self.application.name)) {
                var modal = Modal.confirm.forceUpdate($translate.instant("common_application"));
                return modal.then(function () {
                    return self.saveApplicationNotification(request);
                }, function () {
                    return $q.reject("Cancel");
                });
            } else {
                return self.saveApplicationNotification(request);
            }
        };

        this.saveApplicationNotification = function (request) {
            var keys = Object.keys(request.notifications);
            keys.forEach(function (key) {
                switch (key) {
                    case "jabber":
                    case "email":
                        request.notifications[key].subject = $sanitize(request.notifications[key].subject);
                        request.notifications[key].body = $sanitize(request.notifications[key].body);
                        break;
                    case "tat":
                        request.notifications[key].message = $sanitize(request.notifications[key].message);
                        break;
                }
            });

            return CDSApplicationPipelinesNotificationRsc.insertOrUpdate({
                key: $state.params.key,
                appName: $state.params.appName,
                pipName: request.pipeline.name
            }, request, function (data) {
                self.selected = {
                    notifs :  {}
                };
                if (!self.application.notifications) {
                    self.application.notifications = [];
                }
                var found = false;
                self.application.notifications.forEach(function (n, i) {
                    if (n.application_pipeline_id === data.application_pipeline_id) {
                        self.application.notifications[i] = data;
                        found = true;
                    }
                });
                if (!found) {
                    self.application.notifications.push(data);
                }
                Application.invalidApplication($state.params.key, $state.params.appName);
                self.notifTypes = angular.copy(self.notifTypesRef);
                return Application.getApplication($state.params.key, $state.params.appName).then(function (app) {
                    self.application = app;
                });
            }, function (err) {
                Messaging.error(err);
                return $q.reject(err);
            }).$promise;
        };

        this.createNotification = function () {
            var request;
            if (self.application.notifications) {
                var pipelineNotifs = _.filter(self.application.notifications, { pipeline: { name: self.selected.pipeline.name } });
                if (pipelineNotifs) {
                    pipelineNotifs.forEach(function (n) {
                        if (self.selected.environment && self.selected.environment.name === n.environment.name) {
                            request = n;
                        }
                        if (!self.selected.environment && !self.selected.environment) {
                            request = n;
                        }
                    });
                }
            }

            if (request) {
                for (var notifAdd in self.selected.notifs) {
                    if (self.selected.notifs.hasOwnProperty(notifAdd)) {
                        request.notifications[notifAdd] = self.selected.notifs[notifAdd];
                    }
                }
            } else {
                request = {
                    notifications: self.selected.notifs,
                    pipeline: self.selected.pipeline,
                    environment: self.selected.environment
                };
            }

            return self.insertOrUpdateNotification(request);
        };

        this.init = function () {
            Project.getProject($state.params.key).then(function (data) {
                self.environments = data.environments;
            });
            CDSNotificationTypeRsc.types(function (data) {
                self.notifTypes = data;
                self.notifTypesRef = angular.copy(self.notifTypes);
                if (data && data.length > 0) {
                    self.typeNotifAdded = data[0];
                }
            }, function (err) {
                Messaging.error(err);
            });
            CDSNotificationTypeRsc.states(function (data) {
                self.states = data;
            }, function (err) {
                Messaging.error(err);
            });
        };
        this.init();
    },
    templateUrl: "components/application/notification/notification.html"
});
