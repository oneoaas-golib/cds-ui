"use strict";

/**
 * @ngdoc controller
 * @name cdsApp.controller:UserListCtrl
 * @requires $state, CDSUserRsc, Messaging, Auth
 *
 * @description Manage user listing
 *
 */
angular.module("cdsApp").controller("UserListCtrl", function UserListCtrl ($state, CDSUserRsc, Messaging, Auth) {

    var self = this;
    this.users = [];
    this.admin = false;

    /**
     * @ngdoc function
     * @methodOf cdsApp.controller:UserListCtrl
     * @name goToUser
     * @description Show the selected user
     */
    this.goToUser = function (u) {
        $state.go("app.user-show", { "userName": u.username });
    };

    /**
     * @ngdoc function
     * @methodOf cdsApp.controller:UserListCtrl
     * @name loadUsers
     * @description Load all users
     */
    this.loadUsers = function () {
        CDSUserRsc.query(function (data) {
            self.users = data;
        }, function (err) {
            Messaging.error(err);
        });
    };

    /**
     * @ngdoc function
     * @methodOf cdsApp.controller:UserListCtrl
     * @name init
     * @description Controller initialization
     */
    this.init = function () {
        self.loadUsers();
        Auth.isAdmin().then(function (isAdmin) {
            self.admin = isAdmin;
        });
    };
    this.init();

});
