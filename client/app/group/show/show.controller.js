"use strict";

/**
 * @ngdoc controller
 * @name cdsApp.controller:GroupShowCtrl
 * @requires EditMode, $scope, $translate, $state, CDSGroupsRsc, CDSUserRsc, Messaging
 *
 * @description Manage group
 *
 */
angular.module("cdsApp").controller("GroupShowCtrl", function GroupShowCtrl ($q, $rootScope, EditMode, $scope, $translate, $state, CDSGroupsRsc, CDSUserRsc, Messaging, Auth) {

    var self = this;
    this.group = {};
    this.users = [];
    this.edit = EditMode.get();
    this.newAdmins = [];
    this.newMembers = [];

    /**
     * @ngdoc function
     * @methodOf cdsApp.controller:GroupShowCtrl
     * @name canWrite
     * @description Test if the current user can edit groupe
     */
    this.canWrite = function () {
        var canEditGroup = true;
        Auth.getCurrentUser(null).then(function (user) {
            if (!_.find(self.group.admins, { "username": user.username }) && !user.admin) {
                canEditGroup = false;
            }
            $rootScope.$broadcast("hideEditMode", !canEditGroup);
        });

    };

    /**
     * @ngdoc function
     * @methodOf cdsApp.controller:GroupShowCtrl
     * @name submit
     * @description Submit form
     */
    this.submit = function submit (form) {
        this.submitted = true;
        if (form.$valid) {
            return self.saveGroup();
        }
        return $q.reject("Wrong form");
    };

    this.deleteGroup = function () {
        return CDSGroupsRsc.delete({ "groupName": $state.params.groupName }, {}, function () {
            Messaging.success($translate.instant("group_show_msg_group_deleted"));
            $state.go("app.group-list");
        }, function (err) {
            Messaging.error(err);
            return $q.reject(err);
        }).$promise;
    };

    /**
     * @ngdoc function
     * @methodOf cdsApp.controller:GroupShowCtrl
     * @name saveGroup
     * @description Call API to save the group
     */
    this.saveGroup = function () {
        return CDSGroupsRsc.updateGroup({ "groupName": $state.params.groupName }, self.group, function () {
            if (self.group.name !== $state.params.groupName) {
                $state.go("app.group-show", { "groupName": self.group.name }, { notify: false });
            }
        }, function (err) {
            Messaging.error(err);
            self.loadGroup();
            return $q.reject(err);
        }).$promise;
    };

    /**
     * @ngdoc function
     * @methodOf cdsApp.controller:GroupShowCtrl
     * @name addAdmins
     * @description Add a list of users
     */
    this.addAdmins = function () {
        if (!self.group.admins) {
            self.group.admins = [];
        }
        self.newAdmins.forEach(function (a) {
            if (!_.find(self.group.admins, { "username": a.username })) {
                self.group.admins.push(a);
            }
            _.remove(self.group.users, { "username": a.username });
        });
        self.newAdmins = [];
    };

    /**
     * @ngdoc function
     * @methodOf cdsApp.controller:GroupShowCtrl
     * @name deleteAdmin
     * @description Delete an admin
     */
    this.deleteAdmin = function (a) {
        _.remove(self.group.admins, { "username": a.username });
    };

    /**
     * @ngdoc function
     * @methodOf cdsApp.controller:GroupShowCtrl
     * @name addMembers
     * @description Add a list of user
     */
    this.addMembers = function () {
        if (!self.group.users) {
            self.group.users = [];
        }
        self.newMembers.forEach(function (a) {
            if (!_.find(self.group.users, { "username": a.username })) {
                self.group.users.push(a);
            }
            _.remove(self.group.admins, { "username": a.username });
        });
        self.newMembers = [];
    };

    /**
     * @ngdoc function
     * @methodOf cdsApp.controller:GroupShowCtrl
     * @name deleteMember
     * @description Remove a member from the list
     */
    this.deleteMember = function (a) {
        _.remove(self.group.users, { "username": a.username });
    };

    /**
     * @ngdoc function
     * @methodOf cdsApp.controller:GroupShowCtrl
     * @name loadGroup
     * @description Load the group to edit
     */
    this.loadGroup = function () {
        CDSGroupsRsc.get({ "groupName": $state.params.groupName }, function (data) {
            self.group = data;
            self.canWrite();
        }, function (err) {
            Messaging.error(err);
        });
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
     * @methodOf cdsApp.controller:GroupShowCtrl
     * @name init
     * @description Controller initialization
     */
    this.init = function () {
        self.loadGroup();
        self.loadUsers();
    };
    this.init();

    $scope.$on("editModeStateEvent", function (event, args) {
        self.edit = args;
    });

});
