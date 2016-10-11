"use strict";

angular.module("cdsApp", [
    "mgo-angular-wizard",
    "angularMoment",
    "angular-duration-format",
    "angular.filter",
    "angular-progress-button-styles",
    "base64",
    "cfp.hotkeys",
    "duScroll",
    "favicon",
    "frapontillo.bootstrap-switch",
    "jsplumb-ng",
    "luegg.directives",
    "MassAutoComplete",
    "ngclipboard",
    "ngAnimate",
    "ngMessages",
    "ngResource",
    "ngSanitize",
    "ngStorage",
    "ngFileUpload",
    "ngTouch",
    "focus-if",
    "ovh-common-style",
    "pascalprecht.translate",
    "swimmingPoll",
    "switcher",
    "tmh.dynamicLocale",
    "toaster",
    "ui.bootstrap",
    "ui.codemirror",
    "ui.router",
    "ui.select",
    "ui.sortable",
    "ui.router.title",
    "ui.validate"
])
.config(function ($stateProvider, TranslateDecoratorServiceProvider) {
    // Add translations decorator (need to be added before routes definitions)
    TranslateDecoratorServiceProvider.add($stateProvider);
})
.config(function ($urlRouterProvider, $locationProvider) {
    $urlRouterProvider.otherwise("/");

    $locationProvider.html5Mode(false);
}).config(function ($stateProvider) {
    $stateProvider
        .state("app", {
            abstract : true,
            templateUrl : "app/app.html",
            controllerAs : "ctrl",
            controller : function ($translate, $state, $scope, EditMode, CDSUIVersionRsc, VERSION, $interval, $window, Warning, CDSCacheRsc, Project, Application, Pipeline, Messaging) {
                var self = this;
                this.sidebarVisible = true;
                this.hideEditMode = false;
                this.showRefresh = false;

                $scope.$on("hideEditMode", function (event, args) {
                    self.hideEditMode = args;
                    if (self.hideEditMode) {
                        EditMode.switchOff();
                    }
                });

                $scope.$on("refresh-warning", function () {
                    Warning.loadWarnings();
                });

                var checkVersion = $interval(function () {
                    CDSUIVersionRsc.get({ "ts": (new Date()).getTime() }, function (data) {
                        if (data.version !== VERSION) {
                            self.stopCheckVersion();
                            if (VERSION !== "devMode") {
                                self.showRefresh = true;
                            }
                        }
                    });
                }, 60000);

                this.stopCheckVersion = function () {
                    $interval.cancel(checkVersion);
                };

                this.refresh = function () {
                    $window.location.reload(true);
                };

                function cacheChecker (data) {
                    if (_.isArray(data)) {
                        var currentProjUpdate, currentApplicatinUpdate, currentPipelineUpdate;
                        data.forEach(function (proj) {
                            var b = Project.checkCache(proj);
                            if (b) {
                                currentProjUpdate = true;
                            }
                            if (proj.applications) {
                                proj.applications.forEach(function (app) {
                                    var a = Application.checkCache(proj.key, app);
                                    if (a) {
                                        currentApplicatinUpdate = true;
                                    }
                                });
                            }

                            if (proj.pipelines) {
                                proj.pipelines.forEach(function (pip) {
                                    var p = Pipeline.checkCache(proj.key, pip);
                                    if (p) {
                                        currentPipelineUpdate = true;
                                    }
                                });
                            }
                        });

                        if (currentPipelineUpdate) {
                            Messaging.info($translate.instant("pipeline_updated"));
                        }
                        if (currentApplicatinUpdate) {
                            Messaging.info($translate.instant("application_updated"));
                        }
                        if (currentProjUpdate && !currentPipelineUpdate && !currentApplicatinUpdate) {
                            Messaging.info($translate.instant("project_updated"));
                        }
                    }
                }

                this.init = function () {
                    Warning.loadWarnings();

                    CDSCacheRsc.poll($scope).then(cacheChecker, function (err) {
                        if (err && err.status) {
                            Messaging.error(err);
                        }
                    }, cacheChecker);
                };
                self.init();
            }
        });
});
