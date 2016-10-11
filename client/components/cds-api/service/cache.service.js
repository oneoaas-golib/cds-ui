/**
 * @ngdoc resource
 * @name cdsApp.resource:CDSCacheResc
 * @module cdsApp
 * @description API access to object modification
 *
 */
angular.module("cdsApp").service("CDSCacheRsc", function ($resource, Poller) {
    "use strict";

    var cdsCacheChecker = $resource("/cdsapi/mon/lastupdates");

    cdsCacheChecker.poll = function ($scope) {
        var url = "/cdsapi/mon/lastupdates";

        $scope.$on("$destroy", function () {
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
    return cdsCacheChecker;
});