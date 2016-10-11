"use strict";

/**
 * @ngdoc controller
 * @name cdsApp.controller:GroupListCtrl
 * @requires $translate, $state, CDSGroupsRsc, Messaging
 *
 * @description Manage user listing
 *
 */
angular.module("cdsApp").controller("GroupListCtrl", function GroupListCtrl ($q, $translate, $state, CDSGroupsRsc, Messaging) {

    var self = this;
    this.groups = [];
    this.newGroup = {};

    this.goToGroup = function (group) {
        $state.go("app.group-show", {
            "groupName": group.name
        });
    };

    /**
     * @ngdoc function
     * @name submit
     * @description Submit form
     */
    this.submit = function submit (form) {
        this.submitted = true;
        if (form.$valid) {
            return CDSGroupsRsc.save(self.newGroup, function () {
                self.goToGroup(self.newGroup);
            }, function (err) {
                Messaging.error(err);
                return $q.reject(err);
            }).$promise;
        }
        return $q.reject("Wrong form");
    };

    /**
     * @ngdoc function
     * @methodOf cdsApp.controller:GroupListCtrl
     * @name loadGroups
     * @description Call API to load all groups
     */
    this.loadGroups = function () {
        CDSGroupsRsc.query(function (data) {
            self.groups = data;
        }, function (err) {
            Messaging.error(err);
        });
    };

    /**
     * @ngdoc function
     * @methodOf cdsApp.controller:GroupListCtrl
     * @name init
     * @description Controller initialization
     */
    this.init = function () {
        self.loadGroups();
    };
    this.init();

});
