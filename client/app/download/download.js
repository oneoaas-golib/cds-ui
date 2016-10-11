"use strict";

angular.module("cdsApp")
    .config(function ($stateProvider) {
        $stateProvider
            .state("app.download", {
                url: "/download",
                templateUrl: "app/download/download.html",
                controller: "DownloadCtrl",
                controllerAs: "ctrl",
                translations : [],
                resolve: {
                    $title: function () {
                        return "Download";
                    }
                }
            });
    });
