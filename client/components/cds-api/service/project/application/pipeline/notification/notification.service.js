/**
 * No GET, no Query
 */
angular.module("cdsApp").service("CDSApplicationPipelinesNotificationRsc", function ($resource) {
    "use strict";
    return $resource("/cdsapi/project/:key/application/:appName/pipeline/:pipName/notification", {}, {
        insertOrUpdate: {
            method: "PUT"
        }
    });
});