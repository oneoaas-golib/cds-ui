"use strict";

angular.module("cdsApp").component("groupManagement", {
    bindings: {
        groups: "=",
        save : "&"
    },
    controllerAs: "ctrl",
    controller: function ($scope, $attrs, $translatePartialLoader, $translate, CDSGroupsRsc, Messaging, EditMode) {
        var self = this;

        // List of all permissions
        this.permissions = [];
        this.edit = EditMode.get();

        // List of all existing groups that the user can see
        this.existingGroups = [];

        this.getPermissionName = function (id) {
            if (self.permissions.length > 0) {
                return _.find(self.permissions, { "value": id }).name;
            }
            return "";
        };

        this.canSave = function () {
            return $attrs.save;
        };

        /**
         * @ngdoc function
         * @name submit
         * @description Submit form
         */
        this.submit = function submit (form) {
            this.submitted = true;
            if (form.$valid) {
                self.done();
            }
        };

        /**
         * @ngdoc function
         * @name addGroup
         * @description Create a new group
         */
        this.addGroup = function () {
            if (!self.groups) {
                self.groups = [];
            }
            self.groups.push({ group : { "name" : "" }, "permission": 7 });
        };

        /**
         * @ngdoc function
         * @name removeGroup
         * @description Remove the group a the current index
         */
        this.removeGroup = function (index) {
            self.groups.splice(index, 1);
        };

        function initTranslations () {
            self.loadingTranslations = true;
            $translate.refresh().then(function () {
                self.permissions = [
                    { "name": $translate.instant("group_management_permission_read"), "value": 4 },
                    { "name": $translate.instant("group_management_permission_read_execute"), "value": 5 },
                    { "name": $translate.instant("group_management_permission_read_write_execute"), "value": 7 }
                ];
                self.loadingTranslations = false;
            });
        }

        /**
         * @ngdoc function
         * @name loadExistingGroups
         * @description Call API to get all existing groups
         */
        this.loadExistingGroups = function () {
            CDSGroupsRsc.query(function (data) {
                self.existingGroups = data;
            }, function (err) {
                Messaging.error(err);
            });
        };

        /**
         * @ngdoc function
         * @name refreshResults
         * @description Refresh select2 result to add current user input as a new choice ( to create a new group )
         */
        this.refreshResults = function ($select) {
            var search = $select.search;
            var FLAG = -1;

            if (!_.find(self.existingGroups, { group : { name: search } })) {

                // remove last user input
                if (self.existingGroups[0] && self.existingGroups[0].flag) {
                    self.existingGroups.splice(0, 1);
                }

                self.existingGroups.unshift({
                    flag: FLAG,
                    name: search
                });
            }
        };

        this.init = function () {
            initTranslations();
            self.loadExistingGroups();
        };
        this.init();

        $scope.$on("editModeStateEvent", function (event, args) {
            self.edit = args;
        });
    },
    templateUrl: "components/group-management/groupManagement.html"
});
