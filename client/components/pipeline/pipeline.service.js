"use strict";

angular.module("cdsApp")
    .factory("Pipeline", function AuthService ($state, $q, Messaging, $cacheFactory, CDSPipelineRsc, Project, CDSPipelineJoinedActionRsc) {

        var pipelineCache = $cacheFactory("pipeline");

        function getJoinedActionFromCache (key, pipName, stageID, actionID) {
            if (pipelineCache.get(key + "-" + pipName)) {
                var pipeline = pipelineCache.get(key + "-" + pipName);
                var stage = _.find(pipeline.stages, { id: parseInt(stageID) });
                if (stage && _.find(stage.actions, { id: parseInt(actionID) })) {
                    return _.find(stage.actions, { id: parseInt(actionID) });
                }
            }
            return null;
        }

        var Pipeline = {
            getPipeline: function (key, name) {
                var deferred = $q.defer();
                if (pipelineCache.get(key + "-" + name)) {
                    deferred.resolve(pipelineCache.get(key + "-" + name));
                } else {
                    CDSPipelineRsc.get({ "key": key, "pipName": name }, function (data) {
                        pipelineCache.put(key + "-" + name, data);
                        deferred.resolve(data);
                    }, function (err) {
                        Messaging.error(err);
                        deferred.reject(err);
                    });
                }
                return deferred.promise;
            },
            addPipeline: function (key, pip) {
                return CDSPipelineRsc.save({ "key": key }, pip, function () {
                    Project.invalidProject(key);
                }, function (err) {
                    Messaging.error(err);
                    return $q.reject(err);
                }).$promise;
            },
            update: function (key, pipName, pipUpdated) {
                return CDSPipelineRsc.update({ "key": key, "pipName": pipName }, pipUpdated, function () {
                    Project.invalidProject(key);
                    Pipeline.invalidPipeline(key, pipName);
                }, function (err) {
                    Messaging.error(err);
                    return $q.reject(err);
                }).$promise;
            },
            delete: function (key, pipName) {
                return CDSPipelineRsc.delete({ "key": key, "pipName": pipName }, function () {
                    Project.invalidProject(key);
                    Pipeline.invalidPipeline(key, pipName);
                }, function (err) {
                    Messaging.error(err);
                    return $q.reject(err);
                }).$promise;
            },
            invalidPipeline: function (key, pipName) {
                pipelineCache.remove(key + "-" + pipName);
            },
            getJoinedAction: function (key, pipName, stageID, actionID) {
                var deferred = $q.defer();
                var pipelineAction = getJoinedActionFromCache(key, pipName, stageID, actionID);
                if (!pipelineAction) {
                    Pipeline.getPipeline(key, pipName).then(function () {
                        pipelineAction = getJoinedActionFromCache(key, pipName, stageID, actionID);
                        if (pipelineAction) {
                            deferred.resolve(pipelineAction);
                        } else {
                            deferred.reject("Not Found");
                        }
                    }).catch(function (err) {
                        deferred.reject(err);
                    });
                } else {
                    deferred.resolve(pipelineAction);
                }
                return deferred.promise;
            },
            addJoinedAction: function (key, pipName, stageId, action) {
                var deferred = $q.defer();
                CDSPipelineJoinedActionRsc.save({ "key": key, "pipName": pipName, "stageId": stageId }, action,
                    function (data) {
                        Pipeline.invalidPipeline(key, pipName);
                        action.id = data.id;
                        action.pipeline_action_id = data.pipeline_action_id;
                        action.enabled = data.enabled;
                        deferred.resolve(action);
                    }, function (err) {
                        Messaging.error(err);
                        deferred.reject(err);
                    });
                return deferred.promise;
            },
            updatePipelineAction: function (key, pipName, stageID, actionId, action) {
                var deferred = $q.defer();
                CDSPipelineJoinedActionRsc.update({
                        "key": key,
                        "pipName": pipName,
                        "stageId": stageID,
                        "actionId": actionId
                    },
                    action, function (data) {
                        Pipeline.invalidPipeline(key, pipName);
                        deferred.resolve(data);
                    }, function (err) {
                        Messaging.error(err);
                        deferred.reject(err);
                    });
                return deferred.promise;
            },
            deletePipelineAction: function (key, pipName, stageID, actionId) {
                return CDSPipelineJoinedActionRsc.delete({
                        "key": key,
                        "pipName": pipName,
                        "stageId": stageID,
                        "actionId": actionId
                    },
                    function () {
                        Pipeline.invalidPipeline(key, pipName);
                    }, function (err) {
                        Messaging.error(err);
                        return $q.reject(err);
                    }).$promise;
            },
            existInCache: function (key, pipName) {
                return pipelineCache.get(key + "-" + pipName) !== undefined;
            },
            checkCache: function (key, pipeline) {
                var pipInCache = pipelineCache.get(key + "-" + pipeline.name);
                if (pipInCache && pipInCache.last_modified < pipeline.last_modified) {
                    Pipeline.invalidPipeline(key, pipeline.name);
                } else {
                    return false;
                }
                if ($state.params.pipName === pipeline.name) {
                    return true;
                }
                return false;
            }
        };
        return Pipeline;
    });
