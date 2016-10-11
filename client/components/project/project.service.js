"use strict";

angular.module("cdsApp")
    .factory("Project", function ProjectService ($state, $q, CDSProjectRsc, Messaging, $cacheFactory) {

        var projectCache = $cacheFactory("project");

        var Project = {
            getProject: function (key) {
                var deferred = $q.defer();
                if (projectCache.get(key)) {
                    deferred.resolve(projectCache.get(key));
                } else {
                    CDSProjectRsc.get({ "key": key, "applicationHistory": 5 }, function (data) {
                        projectCache.put(key, data);
                        deferred.resolve(data);
                    }, function (err) {
                        Messaging.error(err);
                        deferred.reject(err);
                    });
                }
                return deferred.promise;
            },
            update: function (project) {
                return CDSProjectRsc.update({ "key": project.key }, project, function (data) {
                    // Update project in cache
                    var projectInCached = projectCache.get(project.key);
                    projectInCached.name = project.name;
                    projectInCached.last_modified = data.last_modified;
                    projectCache.put(project.key, projectInCached);
                    $q.resolve(projectInCached);
                }, function (err) {
                    Messaging.error(err);
                    return $q.reject(err);
                }).$promise;
            },
            updateCacheEnv: function (project) {
                var deferred = $q.defer();
                var projectInCached = projectCache.get(project.key);
                if (projectInCached) {
                    projectInCached.last_modified = project.last_modified;
                    projectInCached.environments.forEach(function (e, i) {
                        if (e.id === project.environments[0].id) {
                            projectInCached.environments[i] = project.environments[0];
                        }
                    });
                    projectCache.put(project.key, projectInCached);
                    deferred.resolve(projectInCached);
                    return deferred.promise;
                } else {
                    return Project.getProject(project.key);
                }
            },
            updateCacheEnvs: function (project) {
                var deferred = $q.defer();
                var projectInCached = projectCache.get(project.key);
                if (projectInCached) {
                    projectInCached.last_modified = project.last_modified;
                    projectInCached.environments = project.environments;
                    projectCache.put(project.key, projectInCached);
                    deferred.resolve(projectInCached);
                    return deferred.promise;
                } else {
                    return Project.getProject(project.key);
                }
            },
            deleteCacheEnv: function (project, envName) {
                var deferred = $q.defer();
                var projectInCached = projectCache.get(project.key);
                if (projectInCached) {
                    projectInCached.last_modified = project.last_modified;
                    projectInCached.environments.forEach(function (e, i) {
                        if (e.name === envName) {
                            projectInCached.environments.splice(i, 1);
                        }
                    });
                    projectCache.put(project.key, projectInCached);
                    deferred.resolve(projectInCached);
                    return deferred.promise;
                } else {
                    return Project.getProject(project.key);
                }
            },
            delete: function (project) {
                return CDSProjectRsc.delete({ "key": project.key }, function () {
                    Project.invalidProject(project.key);
                }, function (err) {
                    Messaging.error(err);
                    return $q.reject(err);
                }).$promise;
            },
            invalidProject: function (key) {
                projectCache.remove(key);
            },
            existInCache: function (key) {
                return projectCache.get(key) !== undefined;
            },
            checkCache: function (proj) {
                var projectInCache = projectCache.get(proj.key);
                if (projectInCache && projectInCache.last_modified < proj.last_modified) {
                    Project.invalidProject(proj.key);
                } else {
                    return false;
                }
                if ($state.params.key === proj.key) {
                    return true;
                }
                return false;
            }
        };
        return Project;
    });
