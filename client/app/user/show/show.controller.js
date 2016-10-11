"use strict";

/**
 * @ngdoc controller
 * @name cdsApp.controller:UserShowCtrl
 * @requires $state, $translate, CDSUserRsc, Messaging, Auth
 *
 * @description Manage user listing
 *
 */
angular.module("cdsApp").controller("UserShowCtrl", function UserListCtrl ($q, $scope, $rootScope, $state, $translate, CDSUserRsc, Messaging, Auth, EditMode) {

    var self = this;
    this.user = {};
    this.edit = EditMode.get();
    this.admin = false;

    /**
     * @ngdoc function
     * @methodOf cdsApp.controller:UserShowCtrl
     * @name submit
     * @description Submit form
     */
    this.submit = function submit (form) {
        this.submitted = true;
        if (form.$valid) {
            return self.saveUser();
        }
        return $q.reject("Wrong form");
    };

    /**
     * @ngdoc function
     * @methodOf cdsApp.controller:UserShowCtrl
     * @name saveUser
     * @description Call API to save the user
     */
    this.saveUser = function () {
        return CDSUserRsc.update({ "userName": $state.params.userName }, self.user, function () {
        }, function (err) {
            Messaging.error(err);
            return $q.reject(err);
        }).$promise;
    };

    /**
     * @ngdoc function
     * @methodOf cdsApp.controller:UserShowCtrl
     * @name deleteUser
     * @description Call API to delete the user
     */
    this.deleteUser = function () {
        return CDSUserRsc.delete({ "userName": $state.params.userName }, {}, function () {
            Messaging.success($translate.instant("user_show_msg_deleted"));
            $state.go("app.user-list");
        }, function (err) {
            Messaging.error(err);
            return $q.reject(err);
        }).$promise;
    };

    /**
     * @ngdoc function
     * @methodOf cdsApp.controller:UserShowCtrl
     * @name loadUser
     * @description Load user
     */
    this.loadUser = function () {
        CDSUserRsc.get({ "userName": $state.params.userName }, function (data) {
            self.user = data;
        }, function (err) {
            Messaging.error(err);
        });
    };

    /**
     * @ngdoc function
     * @methodOf cdsApp.controller:UserShowCtrl
     * @name init
     * @description Controller initialization
     */
    this.init = function () {
        self.loadUser();
        Auth.isAdmin().then(function (isAdmin) {
            self.admin = isAdmin;
            $rootScope.$broadcast("hideEditMode", !isAdmin);
        });
    };
    this.init();

    $scope.$on("editModeStateEvent", function (event, args) {
        self.edit = args;
    });

});
