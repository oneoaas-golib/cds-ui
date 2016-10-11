"use strict";

angular.module("cdsApp").component("sidebar", {
    bindings: {
        visible: "="
    },
    controllerAs: "sidebar",
    controller: function ($scope, $state, $translate, $rootScope, CDSProjectsRsc, Messaging, Auth, hotkeys, $filter) {
        var self = this;

        this.projects = [];
        this.admin = false;
        this.searchValue = "";
        this.focusSearch = false;
        this.activeProjectIndex = -1;
        this.activeApplicationIndex = -1;
        this.activeSubApplicationIndex = -1;

        this.searchFilterProject = function (element) {
            if (self.searchValue === "") {
                return true;
            } else {
                if (element.applications) {
                    if ($filter("fuzzyBy")(element.applications, "filterField", self.searchValue).length > 0) {
                        return true;
                    }
                }
                return false;
            }
        };

        this.resetActiveIndex = function () {
            self.activeApplicationIndex = -1;
            self.activeProjectIndex = -1;
            self.activeSubApplicationIndex = -1;
        };

        this.searchFilterApplication = function (element) {
            if (!self.searchValue || self.searchValue === "") {
                return true;
            }
            if (element.name.toLowerCase().indexOf(self.searchValue.toLowerCase()) !== -1) {
                return true;
            }
            return false;
        };

        this.toggled = function () {
            self.visible = !self.visible;
            $rootScope.$broadcast("sidebarStateChanged", { "state": self.visible });
        };

        this.goToAddProject = function () {
            $state.go("app.project-add");
        };

        /**
         * @ngdoc function
         * @name loadProjects
         * @description  Load project
         */
        this.loadProjects = function () {
            CDSProjectsRsc.list({ application: true }, function (data) {
                self.projects = data;

                if (self.projects) {
                    self.projects.forEach(function (p) {
                        if (p.applications && p.applications.length > 0) {
                            var currentApp = p.applications[0];
                            var appToDelete = [];
                            p.applications.forEach(function (a) {
                                a.filterField = p.name + a.name;
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
                }
            }, function (err) {
                Messaging.error(err);
            });
        };

        this.initHotkeys = function () {
            hotkeys.bindTo($scope)
                .add({
                    combo: "shift+f",
                    description: "focusSearch",
                    callback: function () {
                        self.focusSearch = true;
                    }
                })
                .add({
                    combo: "shift+down",
                    description: "selectDownMenu",
                    callback: function () {
                        if (self.activeApplicationIndex === -1 && self.activeProjectIndex >= -1 && self.activeProjectIndex < self.filteredProject.length - 1) {
                            self.activeProjectIndex++;
                            self.activeApplicationIndex = -1;
                        } else if (self.activeApplicationIndex > -1 && self.activeSubApplicationIndex === -1 && self.activeApplicationIndex < self.filteredApplication.length - 1) {
                            self.activeApplicationIndex++;
                        } else if (self.activeSubApplicationIndex > -1 && self.activeSubApplicationIndex < self.filteredApplication[self.activeApplicationIndex].subApp.length - 1) {
                            self.activeSubApplicationIndex++;
                        }
                    }
                })
                .add({
                    combo: "shift+up",
                    description: "selectUpMenu",
                    callback: function () {
                        if (self.activeApplicationIndex === -1 && self.activeProjectIndex > 0) {
                            self.activeProjectIndex--;
                            self.activeApplicationIndex = -1;
                        } else if (self.activeApplicationIndex > 0 && self.activeSubApplicationIndex === -1) {
                            self.activeApplicationIndex--;
                        } else if (self.activeSubApplicationIndex > 0) {
                            self.activeSubApplicationIndex--;
                        }
                    }
                })
                .add({
                    combo: "shift+left",
                    description: "selectUpMenu",
                    callback: function () {
                        if (self.activeSubApplicationIndex === -1) {
                            self.activeApplicationIndex = -1;
                            self.filteredProject[self.activeProjectIndex].showApp = false;
                        } else {
                            self.activeSubApplicationIndex = -1;
                            self.filteredApplication[self.activeApplicationIndex].showSubApp = false;
                        }

                    }
                })
                .add({
                    combo: "shift+right",
                    description: "selectUpMenu",
                    callback: function () {
                        if (self.activeProjectIndex >= 0 && self.activeApplicationIndex === -1) {
                            self.filteredProject[self.activeProjectIndex].showApp = true;
                            self.activeApplicationIndex = 0;
                        } else if (self.activeProjectIndex >= 0 && self.activeApplicationIndex >= 0 && self.activeSubApplicationIndex === -1 && self.filteredApplication[self.activeApplicationIndex].subApp) {
                            self.filteredApplication[self.activeApplicationIndex].showSubApp = true;
                            self.activeSubApplicationIndex = 0;

                        }
                    }
                })
                .add({
                    combo: "enter",
                    description: "selectUpMenu",
                    callback: function () {
                        if (self.activeSubApplicationIndex !== -1) {
                            $state.go("app.application-show", { "key": self.filteredProject[self.activeProjectIndex].key, "appName": self.filteredApplication[self.activeApplicationIndex].subApp[self.activeSubApplicationIndex].name });
                        } else if (self.activeApplicationIndex !== -1) {
                            $state.go("app.application-show", { "key": self.filteredProject[self.activeProjectIndex].key, "appName": self.filteredApplication[self.activeApplicationIndex].name });
                        } else if (self.activeProjectIndex !== -1) {
                            $state.go("app.project-show", { "key": self.filteredProject[self.activeProjectIndex].key });
                        }
                    }
                });

        };

        this.blurSearch = function () {
            self.focusSearch = false;
        };

        this.init = function () {
            this.loadProjects();
            Auth.isAdmin().then(function (isAdmin) {
                self.admin = isAdmin;
            });
            self.initHotkeys();
        };
        this.init();

        $scope.$on("refreshSideBarEvent", function () {
            self.loadProjects();
        });
    },
    templateUrl: "components/sidebar/sidebar.html"
});
