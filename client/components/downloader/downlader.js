"use strict";

angular.module("cdsApp").component("downloader", {
    bindings: {
        artifact: "="
    },
    controllerAs: "ctrl",
    controller: function ($scope, CDSPipelineBuildRsc, $state, $timeout, Messaging, CONFIG, URLS) {
        var self = this;
        this.disabled = false;

        this.getUrl = function () {
            return CONFIG.apiRouteBase + URLS.artifactDL + "/" + self.artifact.download_hash;
        };

        this.download = function () {
            self.disabled = true;
            CDSPipelineBuildRsc.downloadArtifact({
                    "key": $state.params.key,
                    "appName": $state.params.appName,
                    "pipName": $state.params.pipName,
                    "artifactId": self.artifact.id
                }, function (response) {
                    var uInt8Array = new Uint8Array(response.data);
                    var i = uInt8Array.length;
                    var binaryString = new Array(i);
                    while (i--) {
                        binaryString[i] = String.fromCharCode(uInt8Array[i]);
                    }
                    var data = binaryString.join("");
                    var base64 = btoa(data);

                    $("#artifact_" + self.artifact.id).attr({
                            href: "data:application/*;base64," + base64,
                            download: self.artifact.name
                        })
                        .removeAttr("disabled")
                        .text("Save")
                        .removeClass("btn-primary")
                        .addClass("btn-success");
                }, function (err) {
                Messaging.error(err);
            });
        };
    },
    templateUrl: "components/downloader/downloader.html"
});
