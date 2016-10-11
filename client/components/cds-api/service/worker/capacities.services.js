angular.module("cdsApp").service("CDSWorkerModelCapabilityTypeRsc", function ($resource) {
    "use strict";
    return $resource("/cdsapi/worker/model/capability/type");
});
