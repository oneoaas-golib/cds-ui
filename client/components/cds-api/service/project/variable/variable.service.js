
// Only Update variable.   GET is done by getproject.
angular.module("cdsApp").service("CDSProjectVarRsc", function ($resource) {
    "use strict";
    return $resource("/cdsapi/project/:key/variable/:varName", {}, {
        update: {
            method: "PUT"
        }
    });
});
