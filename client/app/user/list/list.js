"use strict";

angular.module("cdsApp")
    .config(function ($stateProvider) {
        $stateProvider
            .state("app.user-list", {
                url: "/user",
                templateUrl: "app/user/list/list.html",
                controller: "UserListCtrl",
                controllerAs: "ctrl",
                translations : ["app/user/list"],
                resolve : {
                    $title: function () {
                        return "Users";
                    }
                }
            });
    });
