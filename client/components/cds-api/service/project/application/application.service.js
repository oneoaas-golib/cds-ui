/**
 * @ngdoc resource
 * @name cdsApp.resource:CDSApplicationRsc
 * @module cdsApp
 * @description API access to the given application
 *
 */
angular.module("cdsApp").service("CDSApplicationRsc", function ($resource, Poller) {
    "use strict";

    var cdsApplication = $resource("/cdsapi/project/:key/application/:appName", {}, {
        update : {
            method: "PUT"
        },
        branches: {
            method: "GET",
            isArray: true,
            url: "/cdsapi/project/:key/application/:appName/branches"
        },
        versions: {
            url: "/cdsapi/project/:key/application/:appName/version",
            method: "GET",
            isArray: true
        },
        audit: {
            url: "/cdsapi/project/:key/application/:appName/variable/audit",
            method: "GET",
            isArray: true
        },
        restoreAudit: {
            url: "/cdsapi/project/:key/application/:appName/variable/audit/:auditId",
            method: "PUT"
        }
    });

    cdsApplication.poll = function ($scope, opts) {
        var url = ["/cdsapi/project/", opts.key, "/application/", opts.appName, "?applicationStatus=", opts.applicationStatus, "&branchName=", opts.branchName, "&version=", opts.version].join("");

        $scope.$on("$destroy", function () {
            Poller.kill({
                scope: $scope.$id
            });
        });

        $scope.$on("stop-application-poller", function () {
            Poller.kill({
                scope: $scope.$id
            });
        });
        return Poller.poll(
            url, null, {
                successRule : {
                    status : "ok"
                },
                errorRule : {
                    status : "error"
                },
                scope : $scope.$id
            }
        );
    };
    return cdsApplication;
});

/**
 * @ngdoc resource
 * @name cdsApp.resource:CDSApplicationTreeRsc
 * @module cdsApp
 * @description
 *
 */
angular.module("cdsApp").service("CDSApplicationTreeRsc", function ($resource) {
    "use strict";
    return $resource("/cdsapi/project/:key/application/:appName/tree");
});

/**
 * @ngdoc resource
 * @name cdsApp.resource:CDSApplicationCloneRsc
 * @module cdsApp
 * @description
 *
 */
angular.module("cdsApp").service("CDSApplicationCloneRsc", function ($resource) {
    "use strict";
    return $resource("/cdsapi/project/:key/application/:appName/clone");
});
