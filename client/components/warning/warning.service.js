"use strict";

angular.module("cdsApp")
    .factory("Warning", function WarningService (CDSMonitoringRsc, Messaging, $rootScope) {

        var warning = {};

        var Warning = {
            loadWarnings : function () {
                CDSMonitoringRsc.warning(function (data) {
                    Warning.update(data);
                    $rootScope.$broadcast("refresh-warning-data");
                }, function (err) {
                    Messaging.error(err);
                });
            },
            update: function (data) {
                if (data) {
                    var newWarning = {};
                    data.forEach(function (w) {
                        if (w.project && w.project.key) {
                            // Create project struct
                            if (!newWarning[w.project.key]) {
                                newWarning[w.project.key] = {
                                    applications: {},
                                    pipelines: {},
                                    environments: {}
                                };
                            }

                            // Warning on Pipeline
                            if (w.pipeline && w.pipeline.name) {

                                // Create project/pipelines struct
                                if (!newWarning[w.project.key].pipelines[w.pipeline.name]) {
                                    newWarning[w.project.key].pipelines[w.pipeline.name] = {
                                        parameters: [],
                                        jobs: []
                                    };
                                }

                                if (w.action && w.action.name) {
                                    newWarning[w.project.key].pipelines[w.pipeline.name].jobs.push(w);

                                    if (w.application && w.application.name) {
                                        // Create project/application/action struct
                                        if (!newWarning[w.project.key].applications[w.application.name]) {
                                            newWarning[w.project.key].applications[w.application.name] = {
                                                variables: [],
                                                actions: []
                                            };
                                        }
                                        newWarning[w.project.key].applications[w.application.name].actions.push(w);
                                    }
                                }
                            }

                            // Warning on Application
                            if (w.application && w.application.name) {

                                // Create project/pipelines struct
                                if (!newWarning[w.project.key].applications[w.application.name]) {
                                    newWarning[w.project.key].applications[w.application.name] = {
                                        variables: [],
                                        actions: []
                                    };
                                }
                            }

                            // Warning on Environment
                            if (w.environment && w.environment.name) {

                                // Create project/pipelines struct
                                if (!newWarning[w.project.key].environments[w.environment.name]) {
                                    newWarning[w.project.key].environments[w.environment.name] = {
                                        variables: []
                                    };
                                }
                            }
                        }
                    });
                    warning = newWarning;
                }
            },
            getProjectWarning: function (projectKey) {
                if (warning[projectKey]) {
                    return warning[projectKey];
                }
            },
            getPipelineInProjectWarning: function (projectKey, pipName) {
                if (warning[projectKey]) {
                    return warning[projectKey].pipelines[pipName];
                }
            },
            getEnvironmentInProjectWarning: function (projectKey, envName) {
                if (warning[projectKey]) {
                    return warning[projectKey].environments[envName];
                }
            },
            getApplicationInProjectWarning: function (projectKey, appName) {
                if (warning[projectKey]) {
                    return warning[projectKey].applications[appName];
                }
            }
        };
        return Warning;
    });
