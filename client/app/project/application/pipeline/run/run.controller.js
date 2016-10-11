"use strict";

/**
 * @ngdoc controller
 * @name cdsApp.controller:PipelineRunCtrl
 * @requires $translate, $interval, $scope, $state, $uibModal, CDSRepoManagerRsc, Project, CDSApplicationPipelineHistoryRsc, CDSPipelineBuildRsc, Pipeline, durationFilter, Messaging, PipelineBuild, BUILD_CONSTANTS, Application
 *
 * @description Manage show application view
 *
 */
angular.module("cdsApp").controller("PipelineRunCtrl", function ApplicationShowCtrl ($sce, $q, $translate, $interval, $scope, $state, $uibModal, CDSRepoManagerRsc, Project, CDSApplicationPipelineHistoryRsc, CDSPipelineBuildRsc, Pipeline, durationFilter, Messaging, PipelineBuild, BUILD_CONSTANTS, Application, hotkeys, favicon) {

    var self = this;

    // Current build info
    this.currentBuild = {};
    this.buildChildren = [];

    // Previous actions build stats
    this.previousStageStats = {};

    // Current actions build stats
    this.currentActionPercent = {};

    // Current timeLeft
    this.currentActionTimeLeft = {};

    //
    this.isLoading = false;
    this.refreshDelay = 2000;

    // Route params
    this.key = $state.params.key;
    this.pipName = $state.params.pipName;
    this.appName = $state.params.appName;

    // List of artifats
    this.artifacts = [];

    // Aplication datas
    this.application = {};
    this.urlRepo = "";

    // tests results
    this.testsResult = {};
    this.tab = {};

    this.stop = function () {
        return CDSPipelineBuildRsc.stop({ "key": self.key, "appName": self.appName, "pipName": self.pipName, "buildId": self.currentBuild.build_number }, { "envName": $state.params.env }, function () {
            Messaging.success($translate.instant("application_pipeline_msg_stop"));
        }, function (err) {
            Messaging.error(err);
            return $q.reject(err);
        }).$promise;
    };

    this.humanFileSize = function (size) {
        var i = Math.floor(Math.log(size) / Math.log(1024));
        return (size / Math.pow(1024, i)).toFixed(2) * 1 + " " + ["B", "kB", "MB", "GB", "TB"][i];
    };

    /**
     * @ngdoc function
     * @methodOf cdsApp.controller:PipelineRunCtrl
     * @name getBuildDuration
     * @description Return the duration of an action build
     */
    this.getBuildDuration = function (build) {
        var buildStart = new Date(build.start);
        var buildDone = new Date(build.done);
        return buildDone.getTime() - buildStart.getTime();
    };

    /**
     * @ngdoc function
     * @methodOf cdsApp.controller:PipelineRunCtrl
     * @name runAgain
     * @description Restart the current build
     */
    this.runAgain = function () {
        return CDSPipelineBuildRsc.runAgain({
            "key": $state.params.key,
            "appName": $state.params.appName,
            "pipName": $state.params.pipName,
            "buildId": $state.params.buildId,
            "envName": $state.params.env
        }, function (data) {
            $state.go("app.application-pipeline-build", {
                "key": $state.params.key,
                "appName": $state.params.appName,
                "pipName": $state.params.pipName,
                "buildId": data.build_number,
                "env" : $state.params.env
            }, { "reload": true });
        }, function (err) {
            Messaging.error(err);
            return $q.reject(err);
        }).$promise;
    };

    /**
     * @ngdoc function
     * @methodOf cdsApp.controller:PipelineRunCtrl
     * @name getError
     * @description Print test error results
     *
     */
    this.getError = function (te) {
        var err = "";
        if (te.error && te.error !== "") {
            err = te.error;
        }
        if (te.failure && te.failure !== "") {
            err = te.failure;
        }
        var error = err.replace(/[^\n]+/g, function (replacement) {
            return "<p>" + replacement + "</p>";
        });
        return $sce.trustAsHtml(error);
    };

    /**
     * @ngdoc function
     * @methodOf cdsApp.controller:PipelineRunCtrl
     * @name getPanelClass
     * @description Panel class to apply  for tests results
     *
     */
    this.getPanelClass = function (tc) {
        if (tc.failures > 0 || tc.errors > 0) {
            return "panel-danger";
        } else {
            return "panel-success";
        }
    };

    /**
     * @ngdoc function
     * @methodOf cdsApp.controller:PipelineRunCtrl
     * @name getStagePanelClass
     * @description Return panel class for stage
     *
     */
    this.getStagePanelClass = function (stage) {
        var finalClass = "panel-default";
        if (stage.builds) {
            for (var i = 0; i < stage.builds.length; i++) {
                var cssClass = self.getPanelClassByStatus(stage, stage.builds[i].status);
                switch (cssClass) {
                    case "panel-info" :
                        return cssClass; // still building
                    case "panel-warning":
                        switch (finalClass) {
                            case "panel-default":
                            case "panel-skipped":
                            case "panel-disabled":
                                finalClass = cssClass;
                                break;
                            case "panel-success":
                            case "panel-danger":
                                finalClass = "panel-info";
                                break;
                        }
                        break;
                    case "panel-success":
                        switch (finalClass) {
                            case "panel-default":
                            case "panel-skipped":
                            case "panel-disabled":
                                finalClass = cssClass;
                                break;
                            case "panel-warning":
                                finalClass = "panel-info";
                                break;
                        }
                        break;
                    case "panel-danger":
                        switch (finalClass) {
                            case "panel-default":
                            case "panel-skipped":
                            case "panel-disabled":
                            case "panel-success":
                                finalClass = cssClass;
                                break;
                            case "panel-warning":
                                finalClass = "panel-info";
                                break;
                        }
                        break;
                    case "panel-skipped":
                        if (finalClass === "panel-default") {
                            finalClass = cssClass;
                        }
                        break;
                    case "panel-disabled":
                        if (finalClass === "panel-default") {
                            finalClass = cssClass;
                        }
                        break;
                }
            }
        } else {
            return "panel-default";
        }
        return finalClass;
    };

    /**
     * @ngdoc function
     * @methodOf cdsApp.controller:PipelineRunCtrl
     * @name getPanelClassByStatus
     * @description Return panel class for build
     *
     */
    this.getPanelClassByStatus = function (stage, status) {
        switch (status) {
            case "Waiting":
                return "panel-warning";
            case "Building":
                return "panel-info";
            case "Success":
                return "panel-success";
            case "Fail":
                return "panel-danger";
            case "Skipped":
                return "panel-skipped";
            default:
                return "panel-disabled";
        }
    };

    /**
     * @ngdoc function
     * @methodOf cdsApp.controller:PipelineRunCtrl
     * @name getProgressType
     * @description Return progress style by build status
     *
     * Return progress style by build status
     */
    this.getProgressType = function (build) {
        switch (build.status) {
            case "Waiting" :
                return "warning";
            case "Building":
                return "info";
            case "Success":
                return "success";
            case "Fail":
                return "danger";
        }
    };

    /**
     * @ngdoc function
     * @methodOf cdsApp.controller:PipelineRunCtrl
     * @name loadPreviousBuild
     * @description Load previous build result to have time stats
     *
     */
    this.loadPreviousBuild = function () {
        CDSApplicationPipelineHistoryRsc.query({
            "key": $state.params.key,
            "appName": $state.params.appName,
            "pipName": $state.params.pipName,
            "envName": $state.params.env,
            "limit": 1,
            "status": "Success",
            "stage" : "true"
        }, function (data) {
            if (data && data.length === 1) {
                if (data[0].stages) {
                    data[0].stages.forEach(function (stage) {
                        if (stage.builds) {
                            stage.builds.forEach(function (b) {
                                var dateStageStart = new Date(b.start);
                                var dateStageEnd = new Date(b.done);
                                self.previousStageStats[b.pipeline_action_id] = dateStageEnd.getTime() - dateStageStart.getTime();
                            });
                        }
                    });
                }
            }
        }, function (err) {
            Messaging.error(err);
        });
    };

    this.goToBuild = function (pb) {
        $state.go("app.application-pipeline-build", {
            "key": self.key,
            "appName": pb.application.name,
            "pipName": pb.pipeline.name,
            "buildId": pb.build_number,
            "env": pb.environment.name
        });
    };

    this.loadAllHistory = function () {
        CDSApplicationPipelineHistoryRsc.query({
            "key": $state.params.key,
            "appName": $state.params.appName,
            "pipName": $state.params.pipName,
            "envName": $state.params.env,
            "limit": 10
        }, function (data) {
            self.fullHistory = data;
            var build = _.findLast(self.fullHistory, function (b) {
                return b.status === "Building" && b.trigger.vcs_branch === self.currentBuild.trigger.vcs_branch && self.currentBuild.build_number > b.build_number;
            });
            if (build && build.build_number.toString() !== $state.params.buildId) {
                self.simultaneousBuild = build;
            }
        }, function (err) {
            Messaging.error(err);
        });
    };

    /**
     * @ngdoc function
     * @methodOf cdsApp.controller:PipelineRunCtrl
     * @name loadCurrentBuild
     * @description Load current build state
     *
     */
    this.loadCurrentBuild = function () {
        if (!self.isLoading) {
            self.isLoading = true;
            CDSPipelineBuildRsc.get({
                "key": $state.params.key,
                "appName": $state.params.appName,
                "pipName": $state.params.pipName,
                "buildId": $state.params.buildId
            }, { "envName": $state.params.env }, function (data) {
                self.currentBuild = data;
                self.isLoading = false;

                var ended = true;
                self.currentBuild.stages.forEach(function (s) {
                    if (s.builds) {
                        s.builds.forEach(function (b) {
                            if (b.status !== "Success" && b.status !== "Fail" && b.status !== "Disabled" && b.status !== "Skipped") {
                                ended = false;
                            }

                            if (self.previousStageStats[b.pipeline_action_id]) {
                                var time = (new Date()).getTime() - (new Date(b.start)).getTime();
                                self.currentActionPercent[b.pipeline_action_id] = time * 100 / self.previousStageStats[b.pipeline_action_id];
                                self.currentActionTimeLeft[b.pipeline_action_id] = self.previousStageStats[b.pipeline_action_id] - time;
                                if (self.currentActionTimeLeft[b.pipeline_action_id] < 0) {
                                    self.currentActionTimeLeft[b.pipeline_action_id] = 0;
                                }
                            }
                        });
                    }

                });
                if (ended && (self.currentBuild.status === "Fail" || self.currentBuild.status === "Success")) {
                    self.stopTimer();

                    favicon.setProgress(1);
                    if (self.currentBuild.status === "Fail") {
                        favicon.setFailure();
                    } else if (self.currentBuild.status === "Success") {
                        favicon.setSuccess();
                    }

                    CDSPipelineBuildRsc.getNextBuild({
                        "key": $state.params.key,
                        "appName": $state.params.appName,
                        "pipName": $state.params.pipName,
                        "buildId": $state.params.buildId
                    }, {
                        "envName": $state.params.env
                    }, function (data) {
                        self.buildChildren = data;
                    }, function (err) {
                        Messaging.error(err);
                    });
                } else {
                    var countAction = self.countAction(self.currentBuild);
                    var currentPercent = 0;
                    for (var k in self.currentActionPercent) {
                        var actionPercent = self.currentActionPercent[k] / 100;
                        if (actionPercent > 1) {
                            actionPercent = 1;
                        }
                        currentPercent += actionPercent;
                    }
                    favicon.setProgress(currentPercent / countAction);
                }
            }, function (err) {
                Messaging.error(err);
                self.stopTimer();
                self.isLoading = false;
            });

            self.loadArtifact();
            self.loadTestsResult();
        }
    };

    this.countAction = function (b) {
        var nb = 0;
        if (b.stages) {
            b.stages.forEach(function (s, i) {
                if (s.builds) {
                    nb += s.builds.length;
                } else {
                    if (self.pipeline) {
                        nb += self.pipeline.stages[i].actions.length;
                    }
                }
            });
        }
        return nb;
    };

    this.isStageFinished = function (s) {
        if (s.builds) {
            var ended = true;
            s.builds.forEach(function (b)  {
                if (b.status !== "Fail" && b.status !== "Success") {
                    ended = false;
                }
            });
            return ended;
        }
        return false;
    };

    this.getStageTime = function (s) {
        if (s.builds) {
            var timeStart = (new Date(s.builds[0].start)).getTime();
            var timeEnd = (new Date(s.builds[0].done)).getTime();
            s.builds.forEach(function (b)  {
                var newStart = (new Date(b.start)).getTime();
                if (timeStart > newStart) {
                    timeStart = newStart;
                }

                var newEnd = (new Date(b.done)).getTime();
                if (timeEnd < newEnd) {
                    timeEnd = newEnd;
                }
            });
            return timeEnd - timeStart;
        }

    };

    /**
     * @ngdoc function
     * @methodOf cdsApp.controller:ApplicationShowCtrl
     * @name selectTab
     * @description Select tab
     */
    this.selectTab = function (tab) {
        switch (tab) {
            case "detail":
                self.tab.active = 0;
                break;
            case "tests":
                self.tab.active = 1;
                break;
            case "commits":
                self.tab.active = 2;
                break;
            case "history":
                self.tab.active = 3;
                break;
        }
        $state.go("app.application-pipeline-build", {
            "key": $state.params.key,
            "appName": $state.params.appName,
            "pipName": $state.params.pipName,
            "buildId": $state.params.buildId,
            "env": $state.params.env,
            "tab": tab
        }, { notify: false, reload: false });
    };

    this.getTriggerBy = function () {
        if (self.currentBuild.trigger) {
            switch (PipelineBuild.getTriggeredBy(self.currentBuild)) {
                case BUILD_CONSTANTS.TRIGGER_AUTO_HUMAN:
                    return self.currentBuild.trigger.triggered_by.username;
                case BUILD_CONSTANTS.TRIGGER_MANUAL_HUMAN:
                    return self.currentBuild.trigger.triggered_by.username;
                default:
                    return self.currentBuild.trigger.vcs_author;
            }
        }
    };

    /**
     * @ngdoc function
     * @methodOf cdsApp.controller:PipelineRunCtrl
     * @name loadTestsResult
     * @description Refreshing data
     *
     * Refreshing data
     */
    this.loadTestsResult = function () {
        CDSPipelineBuildRsc.getTests({
            "key": $state.params.key,
            "appName": $state.params.appName,
            "pipName": $state.params.pipName,
            "buildId": $state.params.buildId,
            "envName": $state.params.env
        }, function (data) {
            self.testsResult = data;
        }, function (err) {
            Messaging.error(err);
        });
    };

    /**
     * @ngdoc function
     * @methodOf cdsApp.controller:PipelineRunCtrl
     * @name beginRefeshTimer
     * @description Refreshing data
     *
     * Refreshing data
     */
    this.beginRefeshTimer = function () {
        if (self.timer === undefined) {
            self.timer = $interval(self.loadCurrentBuild, self.refreshDelay);
            $scope.$on(
                "$destroy",
                function () {
                    self.stopTimer();
                }
            );
        }
    };

    /**
     * @ngdoc function
     * @methodOf cdsApp.controller:PipelineRunCtrl
     * @name stopRefeshTimer
     * @description Stop refreshing data
     *
     * Stop refreshing data
     */
    this.stopTimer = function () {
        $interval.cancel(self.timer);
        self.timer = undefined;
    };

    /**
     * @ngdoc function
     * @methodOf cdsApp.controller:PipelineRunCtrl
     * @name loadArtifact
     * @description Load built artifacts
     */
    this.loadArtifact = function () {
        CDSPipelineBuildRsc.getArtifacts({
            "key": $state.params.key,
            "appName": $state.params.appName,
            "pipName": $state.params.pipName,
            "buildId": $state.params.buildId,
            "envName": $state.params.env
        }, function (data) {
            self.artifacts = data;
        }, function (err) {
            Messaging.error(err);
        });
    };

    /**
     * @ngdoc function
     * @methodOf cdsApp.controller:PipelineRunCtrl
     * @name loadProject
     * @description Load the given project
     */
    this.loadProject = function () {
        Project.getProject($state.params.key).then(function (data) {
            self.project = data;
        });
    };

    this.openLogs = function (build) {
        $uibModal.open({
            animation: true,
            size: "lg",
            templateUrl: "app/project/application/pipeline/run/modal/logs/show.html",
            controller: "PipelineRunLogsCtrl",
            controllerAs : "ctrl",
            resolve: {
                projectKey: function () {
                    return $state.params.key;
                },
                pipelineName: function () {
                    return $state.params.pipName;
                },
                buildID: function () {
                    return $state.params.buildId;
                },
                build: function () {
                    return build;
                },
                appName: function () {
                    return $state.params.appName;
                },
                envName: function () {
                    return $state.params.env;
                }

            }
        });
    };

    this.openVariables = function (build) {
        $uibModal.open({
            animation: true,
            size: "lg",
            templateUrl: "app/project/application/pipeline/run/modal/variables/show.html",
            controller: "PipelineRunVariablesCtrl",
            controllerAs : "ctrl",
            resolve: {
                build: function () {
                    return build;
                }
            }
        });
    };

    /**
     * @ngdoc function
     * @methodOf cdsApp.controller:PipelineRunCtrl
     * @name loadPipeline
     * @description Load the given pipeline
     */
    this.loadPipeline = function () {
        Pipeline.getPipeline($state.params.key, $state.params.pipName).then(function (data) {
            self.pipeline = data;
        });
    };

    this.loadCommits = function () {
        CDSPipelineBuildRsc.commits({ "key": $state.params.key, "appName": $state.params.appName, "pipName": $state.params.pipName, "buildId": $state.params.buildId, "envName": $state.params.env }, function (data) {
            self.commits = data;
        }, function (err) {
            Messaging.error(err);
        });
    };

    this.loadApplication = function () {
        Application.getApplication($state.params.key, $state.params.appName).then(function (data) {
            self.application = data;
            if (self.application.repositories_manager && !!self.application.repositories_manager.name && !!self.application.repository_fullname) {
                self.loadCommits();

                // Load repository
                CDSRepoManagerRsc.repo({ "key": self.key, "repoManName": self.application.repositories_manager.name, "repo": self.application.repository_fullname }, function (data) {
                    self.urlRepo = data.url;
                }, function (err) {
                    Messaging.error(err);
                });
            }
        });
    };

    this.initHotkeys = function () {
        hotkeys.bindTo($scope)
            .add({
                combo: "e",
                description: "editPipeline",
                callback: function () {
                    $state.go("app.pipeline-show", { "key": self.key, "pipName": self.pipName });
                }
            })
            .add({
                combo: "s",
                description: "stopPipeline",
                callback: function () {
                    if (self.currentBuild.status === "Waiting" || self.currentBuild.status === "Building") {
                        self.stop();
                    }
                }
            });

    };

    this.init = function () {
        if ($state.params.buildId > 1) {
            self.loadPreviousBuild();
        }
        self.loadCurrentBuild();
        self.loadProject();
        self.loadPipeline();
        self.beginRefeshTimer();
        self.selectTab($state.params.tab);
        self.loadApplication();
        self.initHotkeys();
        self.loadAllHistory();
    };

    this.init();

});
