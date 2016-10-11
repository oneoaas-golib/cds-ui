/**
 * @ngdoc resource
 * @name cdsApp.resource:CDSWorkerModelsRsc
 * @module cdsApp
 * @description
 *
 */
angular.module("cdsApp").service("CDSWorkerModelsRsc", function ($resource) {
    "use strict";
    return $resource("/cdsapi/worker/model", {}, {
        loadOne: {
            method: "GET",
            isArray: false,
            params: { name: "@name" }
        }
    });
});

/**
 * @ngdoc resource
 * @name cdsApp.resource:CDSWorkerModelRsc
 * @module cdsApp
 * @description
 *
 */
angular.module("cdsApp").service("CDSWorkerModelRsc", function ($resource) {
    "use strict";
    return $resource("/cdsapi/worker/model/:id", { "id" : "@id" }, {
        update: {
            method: "PUT",
            isArray: false
        }
    });
});

/**
 * @ngdoc resource
 * @name cdsApp.resource:CDSWorkerModelTypeRsc
 * @module cdsApp
 * @description
 *
 */
angular.module("cdsApp").service("CDSWorkerModelTypeRsc", function ($resource) {
    "use strict";
    return $resource("/cdsapi/worker/model/type");
});
