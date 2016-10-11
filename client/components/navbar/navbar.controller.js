"use strict";

/**
 * @ngdoc controller
 * @name cdsApp.controller:NavbarCtrl
 * @requires $state, $translatePartialLoader, $translate, TranslateService, LANGUAGES, Auth
 *
 * @description Manage navbar
 *
 */
angular.module("cdsApp")
    .controller("NavbarCtrl", function ($scope, $rootScope, $state, $translate,
                                        TranslateService, LANGUAGES, Auth, URLS,
                                        CDSProjectsRsc, $localStorage, hotkeys, Messaging) {
        var self = this;
        this.docs = URLS.cdsdoc;
        this.feedback = URLS.feedback;
        this.projects = [];
        this.applications = [];
        this.focusSearch = false;
        this.selected = {
        };

        self.isCollapsed = true;

        // Languages
        self.languages = LANGUAGES.available;
        self.language = TranslateService.getUserLocale();

        self.setLanguage = function (language) {
            TranslateService.setUserLocale(language);
        };

        /**
         * @ngdoc function
         * @name logout
         * @methodOf cdsApp.controller:NavbarCtrl
         * @description User logout
         */
        self.logout = function () {
            Auth.logout();
            $state.go("login");
        };

        this.goToApplication = function (a) {
            self.selected.application = a;
            $state.go("app.application-show", { "key": a.key, "appName": a.name });
        };

        this.getProjectName = function () {
            if (self.selected.project) {
                return self.selected.project.name;
            }
            return $translate.instant("navbar_button_project_default");
        };

        self.appFilter = function (search) {
            return function (app) {
                if (search.length < 3) {
                    return;
                }
                var splittedSearch = search.split(" ");
                if (splittedSearch.length === 1) {
                    if (app.project_name.toLowerCase().indexOf(search.toLowerCase()) !== -1) {
                        return true;
                    }
                    if (app.project_key.toLowerCase().indexOf(search.toLowerCase()) !== -1) {
                        return true;
                    }
                    if (app.name.toLowerCase().indexOf(search.toLowerCase()) !== -1) {
                        return true;
                    }
                } else {
                    var projFilter = splittedSearch[0].toLowerCase();
                    var appFilter = splittedSearch[1].toLowerCase();
                    var projFound = false;
                    var appFound = false;
                    if (app.project_name.toLowerCase().indexOf(projFilter) !== -1) {
                        projFound = true;
                    }
                    if (app.project_key.toLowerCase().indexOf(projFilter) !== -1) {
                        projFound = true;
                    }
                    if (app.name.toLowerCase().indexOf(appFilter) !== -1) {
                        appFound = true;
                    }
                    if (appFound && projFound) {
                        return true;
                    }
                }
                return false;
            };
        };

        this.getApplicationName = function () {
            if (self.selected.application) {
                return self.selected.application.name;
            }
            return $translate.instant("navbar_button_application_dropdown");
        };

        this.onAppSearch = function (item, model) {
            $state.go("app.application-show", { key: model.project_key, appName: model.name });
        };

        /**
         * @ngdoc function
         * @name loadProjects
         * @description  Load project
         */
        this.loadProjects = function () {
            CDSProjectsRsc.list({ application: true }, function (data) {
                self.projects = data;
                self.fuzzyApp = [];
                if (self.projects) {
                    self.projects.forEach(function (p) {
                        if (p.applications && p.applications.length > 0) {
                            var currentApp = p.applications[0];
                            var appToDelete = [];
                            p.applications.forEach(function (a) {
                                a.project_name = p.name;
                                a.project_key = p.key;
                                a.filteredName = p.key + " / " + a.name;
                                self.fuzzyApp.push(angular.copy(a));
                                if (a.name !== currentApp.name && a.name.indexOf(currentApp.name + ".") !== -1) {
                                    if (!currentApp.subApp) {
                                        currentApp.subApp = [];
                                    }
                                    a.subName = a.name.replace(currentApp.name + ".", "");
                                    currentApp.subApp.push(angular.copy(a));
                                    appToDelete.push(a);
                                } else {
                                    currentApp = a;
                                }
                            });
                            appToDelete.forEach(function (app) {
                                _.remove(p.applications, { name: app.name });
                            });
                        }
                    });
                    self.loadApplications();
                }
            }, function (err) {
                Messaging.error(err);
            });
        };

        this.loadApplications = function () {
            var tmp = $localStorage["cds-applications"];
            if (tmp) {
                self.applications = tmp;
            } else {
                self.applications = [];
                if (self.projects && self.projects.length > 0) {
                    self.projects[0].applications.forEach(function (app) {
                        app.key = self.projects[0].key;
                        self.applications.push(app);
                    });
                }
                self.applications = self.applications.slice(0, 15);
                $localStorage["cds-applications"] = self.applications;
            }
        };

        this.initHotkeys = function () {
            hotkeys.bindTo($scope)
                .add({
                    combo: "f",
                    description: "focusSearch",
                    callback: function () {
                        self.focusSearch = true;
                    }
                })
                .add({
                    combo: "p",
                    description: "open project dropdown",
                    callback: function () {
                        self.focusProject = !self.focusProject;
                    }
                })
                .add({
                    combo: "r",
                    description: "open recent application dropdown",
                    callback: function () {
                        self.focusRecent = !self.focusRecent;
                    }
                });
        };

        this.blurSearch = function () {
            self.focusSearch = false;
        };

        this.init = function () {
            self.loadProjects();
            self.initHotkeys();
        };
        self.init();

        $rootScope.$on("select-project", function (event, args) {
            if (args.project) {
                self.selected.project = args.project;
            }
        });

        $rootScope.$on("select-application", function (event, args) {
            if (args.application) {
                self.selected.application = args.application;
                self.selected.project = args.project;
                self.selected.application.key = self.selected.project.key;

                self.applications = $localStorage["cds-applications"];

                var found = false;
                self.applications.forEach(function (app, i) {
                    if (app.name === self.selected.application.name) {
                        found = true;
                        self.applications.splice(i, 1);
                        self.applications.splice(0, 0, app);
                    }
                });

                if (!found) {
                    self.applications.unshift(angular.copy(self.selected.application));
                    self.applications = self.applications.slice(0, 15);
                    $localStorage["cds-applications"] = self.applications;
                }
            }
        });

        $rootScope.$on("refreshSideBarEvent", function () {
            self.loadProjects();
        });

    });