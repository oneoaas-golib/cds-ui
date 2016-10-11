"use strict";

angular.module("cdsApp")
    .factory("Application", function AuthService ($state, $q, $rootScope, Project, CDSApplicationRsc, Messaging, $cacheFactory) {

        var applicationCache = $cacheFactory("application");

        var Application = {

            /**
             * Authenticate user and save token
             *
             * @param  {Object}   appParams     - Application pipeline parameters
             * @param  {Object}   pipParams     - Pipeline parameters
             * @return Application pipeline updated
             */
            mergeParams: function (appParams, pipParams) {
                if (!appParams) {
                    return pipParams ? pipParams : [];
                }

                if (!pipParams) {
                    return [];
                }

                var finalArray = [];
                pipParams.forEach(function (param) {
                    var paramApp = _.find(appParams, { "name": param.name });
                    if (paramApp) {
                        paramApp.description = param.description;
                        paramApp.type = param.type;
                        finalArray.push(paramApp);
                    } else {
                        finalArray.push(param);
                    }
                });
                return finalArray;
            },
            getApplication: function (key, name) {
                var deferred = $q.defer();
                if (applicationCache.get(key + "-" + name)) {
                    deferred.resolve(applicationCache.get(key + "-" + name));
                } else {
                    CDSApplicationRsc.get({ "key": key, "appName": name }, function (data) {
                        applicationCache.put(key + "-" + name, data);
                        deferred.resolve(data);
                    }, function (err) {
                        Messaging.error(err);
                        deferred.reject(err);
                    });
                }
                return deferred.promise;
            },
            update: function (key, appName, appUpdated) {
                return CDSApplicationRsc.update({ "key": key, "appName": appName }, appUpdated, function () {
                    Project.invalidProject(key);
                    Application.invalidApplication(key, appName);
                    $rootScope.$broadcast("refreshSideBarEvent");
                }, function (err) {
                    Messaging.error(err);
                    return $q.reject(err);
                }).$promise;
            },
            delete: function (key, appName) {
                return CDSApplicationRsc.delete({ "key": key, "appName": appName }, function () {
                    $rootScope.$broadcast("refreshSideBarEvent");
                    Project.invalidProject(key);
                    Application.invalidApplication(key, appName);
                }, function (err) {
                    Messaging.error(err);
                    return $q.reject(err);
                }).$promise;
            },
            invalidApplication: function (key, appName) {
                applicationCache.remove(key + "-" + appName);
            },
            existInCache: function (key, appName) {
                return applicationCache.get(key + "-" + appName) !== undefined;
            },
            checkCache: function (key, application) {
                var appInCache = applicationCache.get(key + "-" + application.name);
                if (appInCache && appInCache.last_modified < application.last_modified) {
                    Application.invalidApplication(key, application.name);
                } else {
                    return false;
                }
                if ($state.params.appName === application.name) {
                    return true;
                }
                return false;
            }
        };
        return Application;
    });
